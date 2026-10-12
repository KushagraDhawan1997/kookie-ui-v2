import path from "node:path";
import { Config } from "@remotion/cli/config";

// The shots live in apps/docs and import React from there; point every copy at this package's
// React so the film has one React, not two.
Config.overrideWebpackConfig((config) => ({
  ...config,
  resolve: {
    ...config.resolve,
    alias: {
      ...(config.resolve?.alias ?? {}),
      react: path.resolve("node_modules/react"),
      "react-dom": path.resolve("node_modules/react-dom"),
    },
  },
}));
Config.setBrowserExecutable("/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell");
Config.setVideoImageFormat("png");
Config.setScale(4 / 3);
// SwiftShader: the GPU paths draw a stray rectangle inside glass panes in headless Chromium;
// the software rasteriser draws the lens cleanly (compared frame by frame, 2026-10-12).
Config.setChromiumOpenGlRenderer("swiftshader");
Config.setConcurrency(3);
Config.setCrf(16);
