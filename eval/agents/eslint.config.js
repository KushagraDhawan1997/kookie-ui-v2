// ESLint 10 looks for the config nearest each linted file, so the root `eslint .` uses this file
// for everything under eval/agents/. The harness code takes the root's rules; the fixtures are
// deliberately wrong screens the scorer must catch, so they are not linted.
import rootConfig from "../../eslint.config.js";

export default [{ ignores: ["fixtures/**"] }, ...rootConfig];
