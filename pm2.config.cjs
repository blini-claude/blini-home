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
    {
      name: "blini-product-sync",
      script: "node_modules/.bin/tsx",
      args: "scripts/workers/product-sync-worker.ts",
      cwd: "/app",
      instances: 1,
      autorestart: true,
      max_memory_restart: "256M",
    },
    {
      name: "blini-image-sync",
      script: "node_modules/.bin/tsx",
      args: "scripts/workers/image-sync-worker.ts",
      cwd: "/app",
      instances: 1,
      autorestart: true,
      max_memory_restart: "256M",
    },
    {
      name: "blini-price-sync",
      script: "node_modules/.bin/tsx",
      args: "scripts/workers/price-sync-worker.ts",
      cwd: "/app",
      instances: 1,
      autorestart: true,
      max_memory_restart: "256M",
    },
  ],
};
