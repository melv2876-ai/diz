import { defineConfig } from "eslint/config";
import next from "eslint-config-next";
export default defineConfig([{
    ignores: [
        ".next/**",
        ".next-dev/**",
        ".next_cache_broken_*/**",
        "coverage/**",
        "node_modules/**"
    ],
    extends: [...next],
}]);
