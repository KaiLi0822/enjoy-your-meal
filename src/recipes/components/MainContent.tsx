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
} from "@mui/material";
import { Recipe } from "../../types/recipe";
import { apiAuthClient } from "../../utils/apiClients";

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
  const { recipes, isAuthenticated, menu } = useAuthContext();
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [newRecipe, setNewRecipe] = useState<Recipe>({
    name: "",
    description: "",
    ingredients: [{ name: "", quantity: "" }],
    methods: [""],
    cover: "",
  });
  const [isCoverUploaded, setIsCoverUploaded] = useState("");

  const handleDialogOpen = () => setDialogOpen(true);
  const handleDialogClose = () => {
    setDialogOpen(false);
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
        console.log("File uploaded successfully");
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
      alert("Failed to upload image.");
    }
  };

  const handleSubmit = async () => {
    // Logic to save the new recipe (e.g., POST to backend)
    console.log("Submitting new recipe:", newRecipe);
    setIsCoverUploaded("");
    handleDialogClose();
  };

  const handleExpandClick = (recipeId: string | undefined) => {
    setExpanded(!expanded);
    setExpandRecipe(recipeId);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div>
        <Typography variant="h1" gutterBottom>
          Enjoy Your Meal
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
        {isAuthenticated && menu === "" && (
          <Grid size={{ xs: 12, md: 4 }} key="contributeARecipe">
            <Card
              sx={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
              }}
              onClick={handleDialogOpen}
            >
              <CardHeader title="Contribute A Recipe" />
              <CardMedia
                component="div"
                sx={{
                  height: 194,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
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
              <CardContent>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  {recipe.description}
                </Typography>
              </CardContent>
              <CardActions disableSpacing>
                <IconButton aria-label="add to favorites">
                  <FavoriteIcon />
                </IconButton>
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
                  <Typography sx={{ marginBottom: 2 }}>Ingredients:</Typography>

                  {recipe.ingredients.map((ing) => (
                    <Typography key={ing.name} component="span" display="block">
                      {ing.name}: {ing.quantity}
                    </Typography>
                  ))}

                  <Typography sx={{ marginBottom: 2 }}>Method:</Typography>

                  {recipe.methods.map((method, index) => (
                    <Typography key={index} component="span" display="block">
                      {method}
                    </Typography>
                  ))}
                </CardContent>
              </Collapse>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Dialog open={isDialogOpen} onClose={handleDialogClose} fullWidth>
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
              setNewRecipe((prev) => ({ ...prev, description: e.target.value }))
            }
          />

          {/* Ingredients */}
          <Typography variant="subtitle1" sx={{ mt: 2 }}>
            Ingredients
          </Typography>
          {newRecipe.ingredients.map((ingredient, index) => (
            <Box key={index} display="flex" gap={2} alignItems="center" mb={1}>
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
            <Box key={index} display="flex" gap={2} alignItems="center" mb={1}>
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
    </Box>
  );
}
