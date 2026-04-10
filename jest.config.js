export default {
    preset: "ts-jest",
    testEnvironment: "jsdom",
    setupFilesAfterEnv: [],
    transform: {
        "^.+\\.ts$": ["ts-jest", {
            tsconfig: "tsconfig.test.json",
        }],
    },
    collectCoverageFrom: [
        "src/main/**/*.ts",
        "!**/index.ts",
    ],
    coverageThreshold: {
        global: {
            statements: 80,
            branches: 80,
            functions: 80,
            lines: 80,
        },
    },
    coverageDirectory: "coverage",
    reporters: [["github-actions", {silent: false}], "summary"],
};
