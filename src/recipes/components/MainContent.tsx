import { useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Grid from "@mui/material/Grid2";
import FormControl from "@mui/material/FormControl";
import InputAdornment from "@mui/material/InputAdornment";
import OutlinedInput from "@mui/material/OutlinedInput";
import { styled } from "@mui/material/styles";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import IconButton, { IconButtonProps } from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CardActions from "@mui/material/CardActions";
import Collapse from "@mui/material/Collapse";
import CardHeader from "@mui/material/CardHeader";
import { useAuthContext } from "../../contexts/AuthContext";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  DialogActions,
  Checkbox,
} from "@mui/material";
import { Recipe } from "../../types/recipe";
import { apiAuthClient } from "../../utils/apiClients";
import { useNavigate } from "react-router-dom";
import CenteredSnackbar from "./CenteredSnackbar";

export function Search() {
  return (
    <FormControl sx={{ width: { xs: "100%", md: "25ch" } }} variant="outlined">
      <OutlinedInput
        size="small"
        placeholder="Search…"
        sx={{ flexGrow: 1 }}
        startAdornment={
          <InputAdornment position="start" sx={{ color: "text.primary" }}>
            <SearchRoundedIcon fontSize="small" />
          </InputAdornment>
        }
        inputProps={{
          "aria-label": "search",
        }}
      />
    </FormControl>
  );
}

interface ExpandMoreProps extends IconButtonProps {
  expand: boolean;
}

const ExpandMore = styled((props: ExpandMoreProps) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  marginLeft: "auto",
  transition: theme.transitions.create("transform", {
    duration: theme.transitions.duration.shortest,
  }),
  transform: expand ? "rotate(180deg)" : "rotate(0deg)",
}));

export default function MainContent() {
  const [expanded, setExpanded] = useState(false);
  const [expandRecipe, setExpandRecipe] = useState<string | undefined>("");
  const {
    recipes,
    isAuthenticated,
    menu,
    setRecipes,
    recipeMenus,
    menus,
    setRecipeMenus,
  } = useAuthContext();
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [newRecipe, setNewRecipe] = useState<Recipe>({
    name: "",
    description: "",
    ingredients: [{ name: "", quantity: "" }],
    methods: [""],
    cover: "",
  });
  const [isCoverUploaded, setIsCoverUploaded] = useState("");
  const [showSignInPrompt, setShowSignInPrompt] = useState(false);
  const [menuDialogOpen, setMenuDialogOpen] = useState("");
  const [selectedMenus, setSelectedMenus] = useState<string[]>([]);
  const [setAlertMessageMessage, setAlertMessage] = useState("");

  const navigate = useNavigate();
  const handleDialogOpen = () => {
    // Show the dialog if isAuth
    if (isAuthenticated) {
      setDialogOpen(true);
    } else {
      //  Otherwise show a dialog and ask user to sign-in
      setShowSignInPrompt(true);
    }
  };
  const handleDialogClose = () => {
    setDialogOpen(false);
    setNewRecipe({
      name: "",
      description: "",
      ingredients: [{ name: "", quantity: "" }],
      methods: [""],
      cover: "",
    });
    setIsCoverUploaded("");
  };

  const handleAddIngredient = () => {
    setNewRecipe((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, { name: "", quantity: "" }],
    }));
  };

  const handleRemoveIngredient = (index: number) => {
    setNewRecipe((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index),
    }));
  };

  const handleAddMethod = () => {
    setNewRecipe((prev) => ({
      ...prev,
      methods: [...prev.methods, ""],
    }));
  };

  const handleRemoveMethod = (index: number) => {
    setNewRecipe((prev) => ({
      ...prev,
      methods: prev.methods.filter((_, i) => i !== index),
    }));
  };

  // Function to upload the file to S3 using the signed URL
  const uploadFileToS3 = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("file", file); // The name here must match "file"
      const response = await apiAuthClient.post("/s3/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200) {
        return response.data.data;
      } else {
        console.error("File upload failed", response);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const fileName = file.name;

    try {
      // Step 2: Upload the file to S3
      const uniqueFileName = await uploadFileToS3(file);
      // Step 3: Update the state with the S3 URL
      setNewRecipe((prev) => ({
        ...prev,
        cover: uniqueFileName,
      }));
      setIsCoverUploaded(fileName);
    } catch (error) {
      console.error("Error uploading image:", error);
      setAlertMessage("Failed to upload image.");
    }
  };

  const handleSubmit = async () => {
    try {
      // Validate required fields
      const { name, description, ingredients, methods, cover } = newRecipe;
      if (
        !name ||
        !description ||
        ingredients.length === 0 ||
        methods.length === 0 ||
        !cover
      ) {
        setAlertMessage("Please fill out all fields before submitting.");
        return;
      }

      // Filter out empty ingredients and methods
      const cleanedIngredients = ingredients.filter(
        (ingredient) =>
          ingredient.name.trim() !== "" && ingredient.quantity.trim() !== ""
      );
      const cleanedMethods = methods.filter((method) => method.trim() !== "");

      if (cleanedIngredients.length === 0 || cleanedMethods.length === 0) {
        setAlertMessage(
          "Please ensure all ingredients and methods are filled out."
        );
        return;
      }

      // Prepare the request body
      const requestBody = {
        name: name.trim(),
        description: description.trim(),
        ingredients: cleanedIngredients,
        methods: cleanedMethods,
        cover, // Assume this contains the uploaded file URL or name
      };
      // Send the request to the backend
      const response = await apiAuthClient.post("/users/recipe", requestBody);

      if (response.status === 201) {
        setAlertMessage("Recipe added successfully!");
        // Optionally, refresh the recipes list if needed
      } else {
        setAlertMessage("Failed to add recipe. Please try again.");
      }
    } catch (error) {
      console.error("Error adding recipe:", error);
      setAlertMessage("An unexpected error occurred. Please try again later.");
    } finally {
      // Reset the form state and close the dialog
      setIsCoverUploaded("");
      handleDialogClose();
      const response = await apiAuthClient.get("/users/recipes");
      setRecipes(response.data.data);
    }
  };

  const handleExpandClick = (recipeId: string | undefined) => {
    setExpanded(!expanded);
    setExpandRecipe(recipeId);
  };

  const handleSignInPromptClose = () => {
    setShowSignInPrompt(false);
  };

  const handleMenuSelectionChange = (menu: string) => {
    if (selectedMenus.includes(menu)) {
      // Uncheck the menu
      setSelectedMenus(selectedMenus.filter((item) => item !== menu));
    } else {
      // Check the menu
      setSelectedMenus([...selectedMenus, menu]);
    }
  };

  const handleSaveMenus = async () => {
    try {
      const originalMenus = recipeMenus.get(menuDialogOpen) || [];
      const encodedMenuDialogOpen = encodeURIComponent(menuDialogOpen);

      // Find menus to add (in selectedMenus but not in originalMenus)
      const filterSelectedMenus = selectedMenus.filter(
        (menu) => !originalMenus.includes(menu)
      );

      for (const menu of filterSelectedMenus) {
        await apiAuthClient.post(
          `/users/menus/${menu}/recipe/${encodedMenuDialogOpen}`
        );
      }

      // Find menus to remove (in originalMenus but not in selectedMenus)
      const filterOriginalMenus = originalMenus.filter(
        (menu) => !selectedMenus.includes(menu)
      );

      for (const menu of filterOriginalMenus) {
        await apiAuthClient.delete(
          `/users/menus/${menu}/recipe/${encodedMenuDialogOpen}`
        );
      }

      // fetch the recipeMenus again
      const response = await apiAuthClient.get("/users/recipeMenus");
      const recipeMenusMap = new Map<string, string[]>(
        Object.entries(response.data.data)
      );

      setRecipeMenus(recipeMenusMap);
      setMenuDialogOpen("");
    } catch (error) {
      console.error("Failed to save menus:", error);
      setAlertMessage("Failed to update menus. Please try again.");
    }
  };

  const handleFavoriteClick = (recipeId: string | undefined) => {
    if (!isAuthenticated) {
      setShowSignInPrompt(true); // Show the sign-in dialog if not authenticated
      return;
    }
    const currentMenus = recipeMenus.get(recipeId ?? "") || [];
    setSelectedMenus(currentMenus);
    setMenuDialogOpen(recipeId ?? "");
  };

  return (
    <>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <div>
          <Typography variant="h1" gutterBottom>
            {isAuthenticated
              ? menu === ""
                ? "Your Recipes"
                : menu === null
                ? "Enjoy Your Meal"
                : menu.replace("menu#", "")
              : "Enjoy Your Meal"}
          </Typography>
        </div>
        <Box
          sx={{
            display: { xs: "flex", sm: "none" },
            flexDirection: "row",
            gap: 1,
            width: { xs: "100%", md: "fit-content" },
            overflow: "auto",
          }}
        >
          <Search />
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column-reverse", md: "row" },
            width: "100%",
            justifyContent: "space-between",
            alignItems: { xs: "start", md: "center" },
            gap: 4,
            overflow: "auto",
          }}
        >
          <Box
            sx={{
              display: { xs: "none", sm: "flex" },
              flexDirection: "row",
              gap: 1,
              width: { xs: "100%", md: "fit-content" },
              overflow: "auto",
            }}
          >
            <Search />
          </Box>
        </Box>
        <Grid container spacing={2} columns={12}>
          {(!isAuthenticated || menu === "") && (
            <Grid size={{ xs: 12, md: 4 }} key="contributeARecipe">
              <Card>
                <CardHeader title="Contribute A Recipe" />
                <CardMedia
                  component="div"
                  sx={{
                    height: 274,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                  onClick={handleDialogOpen}
                >
                  <AddIcon sx={{ fontSize: 80, color: "#9e9e9e" }} />
                </CardMedia>
              </Card>
            </Grid>
          )}
          {recipes.map((recipe) => (
            <Grid size={{ xs: 12, md: 4 }} key={recipe.SK}>
              <Card>
                <CardHeader title={recipe.name} />
                <CardMedia
                  component="img"
                  height="194"
                  image={recipe.cover || "/Image-not-found.png"}
                  alt={recipe.name}
                />
                <CardContent
                  sx={{
                    height: 40, // Fixed height for consistency
                    overflow: "auto", // Enable scrolling for overflow
                  }}
                >
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    {recipe.description}
                  </Typography>
                </CardContent>
                <CardActions disableSpacing>
                  {(menu === "" || menu === null) && (
                    <IconButton
                      aria-label="add to favorites"
                      onClick={() => handleFavoriteClick(recipe.SK)}
                    >
                      <FavoriteIcon
                        color={
                          recipeMenus.has(recipe.SK ?? "") && isAuthenticated
                            ? "error"
                            : "inherit"
                        }
                      />
                    </IconButton>
                  )}
                  <ExpandMore
                    expand={expanded && recipe.SK === expandRecipe}
                    onClick={() => handleExpandClick(recipe.SK)}
                    aria-expanded={expanded}
                    aria-label="show more"
                  >
                    <ExpandMoreIcon />
                  </ExpandMore>
                </CardActions>
                <Collapse
                  in={expanded && recipe.SK === expandRecipe}
                  timeout="auto"
                  unmountOnExit
                >
                  <CardContent>
                    <Typography sx={{ marginBottom: 2 }}>
                      Ingredients:
                    </Typography>

                    {recipe.ingredients.map((ing) => (
                      <Typography
                        key={ing.name}
                        component="span"
                        display="block"
                      >
                        {ing.name}: {ing.quantity}
                      </Typography>
                    ))}

                    <Typography sx={{ marginBottom: 2, marginTop: 2 }}>
                      Method:
                    </Typography>

                    {recipe.methods.map((method, index) => (
                      <Typography key={index} component="span" display="block">
                        * {method}
                      </Typography>
                    ))}
                  </CardContent>
                </Collapse>
              </Card>
            </Grid>
          ))}
        </Grid>
        <Dialog open={isDialogOpen} onClose={handleDialogClose} fullWidth disableRestoreFocus>
          <DialogTitle>Add a New Recipe</DialogTitle>
          <DialogContent>
            {/* Recipe Name */}
            <TextField
              variant="standard"
              fullWidth
              label="Recipe Name"
              value={newRecipe.name}
              onChange={(e) =>
                setNewRecipe((prev) => ({ ...prev, name: e.target.value }))
              }
              onBlur={() => {
                const newName = newRecipe.name;

                // Check if the exact name already exists in the recipes array
                const nameExists = recipes.some(
                  (recipe) =>
                    recipe.name.trim().toLowerCase() === newName.toLowerCase()
                );

                if (nameExists) {
                  setAlertMessage(
                    "A recipe with this exact name already exists. Please choose a different name."
                  );
                  setNewRecipe((prev) => ({ ...prev, name: "" })); // Clear the input
                }
              }}
            />

            {/* Description */}
            <TextField
              fullWidth
              // margin="normal"
              label="Description"
              variant="standard"
              multiline
              // rows={3}
              value={newRecipe.description}
              onChange={(e) =>
                setNewRecipe((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
            />

            {/* Ingredients */}
            <Typography variant="subtitle1" sx={{ mt: 2 }}>
              Ingredients
            </Typography>
            {newRecipe.ingredients.map((ingredient, index) => (
              <Box
                key={index}
                display="flex"
                gap={2}
                alignItems="center"
                mb={1}
              >
                <TextField
                  variant="standard"
                  label="Name"
                  value={ingredient.name}
                  onChange={(e) => {
                    const updatedIngredients = [...newRecipe.ingredients];
                    updatedIngredients[index].name = e.target.value;
                    setNewRecipe((prev) => ({
                      ...prev,
                      ingredients: updatedIngredients,
                    }));
                  }}
                />
                <TextField
                  variant="standard"
                  label="Quantity"
                  value={ingredient.quantity}
                  onChange={(e) => {
                    const updatedIngredients = [...newRecipe.ingredients];
                    updatedIngredients[index].quantity = e.target.value;
                    setNewRecipe((prev) => ({
                      ...prev,
                      ingredients: updatedIngredients,
                    }));
                  }}
                />
                <IconButton
                  color="error"
                  onClick={() => handleRemoveIngredient(index)}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
            <Button onClick={handleAddIngredient}>Add Ingredient</Button>

            {/* Methods */}
            <Typography variant="subtitle1" sx={{ mt: 2 }}>
              Methods
            </Typography>
            {newRecipe.methods.map((method, index) => (
              <Box
                key={index}
                display="flex"
                gap={2}
                alignItems="center"
                mb={1}
              >
                <TextField
                  fullWidth
                  variant="standard"
                  label={`Step ${index + 1}`}
                  value={method}
                  onChange={(e) => {
                    const updatedMethods = [...newRecipe.methods];
                    updatedMethods[index] = e.target.value;
                    setNewRecipe((prev) => ({
                      ...prev,
                      methods: updatedMethods,
                    }));
                  }}
                />
                <IconButton
                  color="error"
                  onClick={() => handleRemoveMethod(index)}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
            <Button onClick={handleAddMethod}>Add Step</Button>

            {/* Cover Upload */}
            <Typography variant="subtitle1" sx={{ mt: 2 }}>
              Cover
            </Typography>
            <Button variant="outlined" component="label">
              Upload File
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleFileChange}
              />
            </Button>

            {isCoverUploaded === "loading" ? (
              <p>Uploading image, please wait...</p>
            ) : isCoverUploaded !== "" ? (
              <p>Uploaded: {isCoverUploaded}</p>
            ) : (
              <p>No image uploaded yet.</p>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose} color="secondary">
              Cancel
            </Button>
            <Button onClick={handleSubmit} variant="contained" color="primary">
              Save
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog open={showSignInPrompt} onClose={handleSignInPromptClose} disableRestoreFocus>
          <DialogTitle>Sign In Required</DialogTitle>
          <DialogContent>
            <Typography>
              You need to sign in to proceed. Please log in to continue.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleSignInPromptClose} color="secondary">
              Cancel
            </Button>
            <Button
              onClick={() => {
                handleSignInPromptClose();
                // Redirect to login page
                navigate("/signin"); // Replace with your login route
              }}
              variant="contained"
              color="primary"
            >
              Sign In
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={menuDialogOpen !== ""}
          onClose={() => setMenuDialogOpen("")}
          disableRestoreFocus
        >
          <DialogTitle>Select Menus</DialogTitle>
          <DialogContent>
            {menus.map((menu) => (
              <Box key={menu.name} display="flex" alignItems="center" gap={1}>
                <Checkbox
                  checked={selectedMenus.includes(menu.name)}
                  onChange={() => handleMenuSelectionChange(menu.name)}
                />
                <Typography>{menu.name}</Typography>
              </Box>
            ))}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setMenuDialogOpen("")} color="secondary">
              Cancel
            </Button>
            <Button
              onClick={handleSaveMenus}
              variant="contained"
              color="primary"
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </Box>

      <CenteredSnackbar
        message={setAlertMessageMessage}
        onClose={() => setAlertMessage("")}
      />
    </>
  );
}
