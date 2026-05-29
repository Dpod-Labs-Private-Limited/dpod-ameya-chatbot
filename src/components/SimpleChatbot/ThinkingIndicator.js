import React, { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";

const ThinkingIndicator = () => {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <Box>
      <Typography sx={{ fontSize: "14px", fontWeight: "400" }}>Thinking{dots}</Typography>
    </Box>
  );
};

export default ThinkingIndicator;
