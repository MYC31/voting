module.exports = {
  // 网络配置
  networks: {
    development: {
      host: "localhost",     // 本地主机
      port: 7545,            // Ganache 默认端口
      network_id: "*",       // 匹配任何网络 id
    },
    // 可以根据需要添加其他网络配置，比如测试网或主网
  },

  // Solidity 编译器配置
  compilers: {
    solc: {
      version: "0.8.0",      // 使用 0.8.0 版本的 Solidity 编译器
      settings: {
        optimizer: {
          enabled: true,    // 启用优化
          runs: 200         // 优化次数
        },
        evmVersion: "istanbul" // EVM 版本（可选）
      }
    }
  },

  // Mocha 测试框架配置（可选）
  mocha: {
    // timeout: 100000      // 设置测试超时时间（毫秒）
  },

  // Truffle DB 配置（可选）
  db: {
    enabled: false          // 禁用 Truffle DB
  }
};

