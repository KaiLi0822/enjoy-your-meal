import * as React from "react";
import Avatar from "@mui/material/Avatar";
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
import { red } from "@mui/material/colors";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CardActions from "@mui/material/CardActions";
import Collapse from "@mui/material/Collapse";
import CardHeader from "@mui/material/CardHeader";
import { useAuthContext } from "../../contexts/AuthContext";

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
  const [expanded, setExpanded] = React.useState(false);
  const [expandRecipe, setExpandRecipe] = React.useState("");
  const { recipes } = useAuthContext(); 
  const handleExpandClick = (recipeId: string) => {
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
          {recipes.map((recipe) => (
            <Grid size={{ xs: 12, md: 4 }} key={recipe.SK}>
              <Card>
                <CardHeader
                  avatar={
                    <Avatar sx={{ bgcolor: red[500] }} aria-label="recipe">
                      {recipe.PK.charAt(0)}
                    </Avatar>
                  }
                  title={recipe.name}
                />
                <CardMedia
                  component="img"
                  height="194"
                  image={recipe.cover}
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
                    <Typography sx={{ marginBottom: 2 }}>
                      Ingredients:
                    </Typography>
                    <Typography sx={{ marginBottom: 2 }}>
                      {recipe.ingredients.map((ing) => (
                      <Typography key={ing.name} component="span" display="block">
                      {ing.name}: {ing.quantity}
                    </Typography>
                      ))}
                    </Typography>
                    <Typography sx={{ marginBottom: 2 }}>Method:</Typography>
                    <Typography sx={{ marginBottom: 2 }}>
                      {recipe.methods.map((method, index) => (
                         <Typography key={index} component="span" display="block">
                         {method}
                       </Typography>
                      ))}
                    </Typography>
                  </CardContent>
                </Collapse>
              </Card>
            </Grid>
          ))}
        </Grid>
      
    </Box>
  );
}
