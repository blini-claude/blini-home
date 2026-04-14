module.exports = {
  apps: [
    {
      name: "blini-home",
      script: "node_modules/.bin/next",
      args: "start -p 3000",
      cwd: "/app",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      instances: 1,
      autorestart: true,
      max_memory_restart: "512M",
    },
  ],
};
