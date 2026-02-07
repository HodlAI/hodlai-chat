export interface TranslationStructure {
  nav: {
    chat: string;
    dashboard: string;
    create: string;
    rankings: string;
    connect: string;
  };
  home: {
    sloganPrefix: string;
    sloganHighlight: string;
    subtitle: string;
    startChat: string;
    live: string;
    connectLaunch: string;
    stats: {
      agents: string;
      messages: string;
      avgCost: string;
    };
    description: string;
    features: {
      title: string;
      f1Title: string;
      f1Desc: string;
      f2Title: string;
      f2Desc: string;
      f3Title: string;
      f3Desc: string;
    };
  };
  chat: {
    sidebarTitle: string;
    newChat: string;
    history: string;
    noHistory: string;
    settings: string;
    placeholder: string;
    send: string;
    webSearch: string;
    attachFile: string;
    welcome: string;
    suggestions: string[];
    thinking: string;
    copy: string;
    copied: string;
    regenerate: string;
    model: string;
    today: string;
    yesterday: string;
    previous7Days: string;
    previous: string;
    loginAlert: string;
    configureModels: string;
    enterApiKey: string;
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    confirm: string;
    activeModels: string;
    filterModels: string;
    loadingModels: string;
    connectWallet: string;
    walletConnected: string;
    connected: string;
    disconnect: string;
    apiKey: string;
    apiKeyPlaceholder: string;
    optionalIfConnected: string;
    configureApiKey: string;
    signToLogin: string;
    todaysQuota: string;
    remainQuota: string;
    balance: string;
    hodlBalance: string;
    credits: string;
    current: string;
    refreshStats: string;
    noResponse: string;
    loading: string;
    close: string;
    done: string;
    selectModel: string;
    searchOn: string;
    dropFiles: string;
    disclaimer: string;
  };
  create: {
    title: string;
    subtitle: string;
    saveDraft: string;
    uploadBanner: string;
    uploadAvatar: string;
    coverLabel: string;
    steps: {
      core: string;
      kb: string;
      logic: string;
      token: string;
    };
    coreDetails: string;
    agentName: string;
    agentNamePlaceholder: string;
    descPlaceholder: string;
    category: string;
    categories: {
      defi: string;
      research: string;
      content: string;
    };
    stats: string;
    winRate: string;
    earned: string;
    txs: string;
    bio: string;
    suggestion: string;
    level: string;
    type: string;
    visibility: string;
    public: string;
    private: string;
    required: string;
    pending: string;
    next: string;
    estFee: string;
    preview: string;
    visualIdentity: string;
    words: string;
  };
  dashboard: {
    title: string;
    stats: {
      activeAgents: string;
      interactions: string;
      credits: string;
      earned: string;
      live: string;
    };
    chartTitle: string;
    rankingTitle: string;
  };
  footer: {
    desc: string;
    terms: string;
    privacy: string;
    rights: string;
  };
  config: {
    title: string;
    customBaseUrl: string;
    customBaseUrlDesc: string;
    customApiKey: string;
    customApiKeyDesc: string;
    appearance: string;
    light: string;
    dark: string;
    system: string;
    theme: string;
    language: string;
    languageLabel: string;
    saveAndReload: string;
    cancel: string;
    settings: string;
  };
  errors: {
    connectionFailed: string;
    connectionCancelled: string;
    installWallet: string;
    sessionExpired: string;
    rateLimited: string;
    insufficientCredits: string;
    aiResponseFailed: string;
    invalidApiKey: string;
  };
}

export const translations: Record<string, TranslationStructure> = {
  en: {
    nav: {
      chat: 'Chat',
      dashboard: 'Dashboard',
      create: 'Create Agent',
      rankings: 'Rankings',
      connect: 'Connect Wallet'
    },
    home: {
      sloganPrefix: 'The Future of',
      sloganHighlight: 'Sovereign AI',
      subtitle: 'Web3 Native Intelligence on BNB Chain.',
      startChat: 'Start Chatting',
      live: 'Live on BSC Mainnet',
      connectLaunch: 'Connect to Launch',
      stats: {
        agents: 'Agents',
        messages: 'Messages',
        avgCost: 'Avg Cost'
      },
      description: "Don't rent intelligence. Own the asset that generates it. Holding $HODLAI grants you perpetual access to the decentralized AI gateway.",
      features: {
        title: 'Why build on HodlAI Chat?',
        f1Title: 'Web3 Native Login',
        f1Desc: 'Forget passwords. Seamless authentication using your existing crypto wallet (Metamask, TrustWallet, etc).',
        f2Title: 'Cheaper AI Access',
        f2Desc: "Leverage BSC's ultra-low gas fees for affordable interactions. Pay per prompt with stablecoins or BNB.",
        f3Title: 'No-code Agents',
        f3Desc: 'Deploy custom AI agents instantly. Define personality, knowledge base, and tools via a simple visual interface.'
      }
    },
    chat: {
      sidebarTitle: 'Web3 Agent',
      newChat: 'New Chat',
      history: 'History',
      noHistory: 'No chat history',
      settings: 'Settings',
      placeholder: 'Ask Web3 Agent anything...',
      send: 'Send',
      webSearch: 'Web Search',
      attachFile: 'Attach File',
      welcome: 'How can I help you today?',
      suggestions: [
        'Analyze Market Trends',
        'Explain Zero-Knowledge Proofs (ZKP)',
        'Write a Solidity Contract',
        'Debug this React Code',
        'Summarize this PDF',
        'Explain Quantum Computing',
        'Draft a Python script',
        'Write a Poem about AI'
      ],
      thinking: 'AI is thinking...',
      copy: 'Copy',
      copied: 'Copied!',
      regenerate: 'Regenerate',
      model: 'Model:',
      today: 'Today',
      yesterday: 'Yesterday',
      previous7Days: 'Previous 7 Days',
      previous: 'Previous',
      loginAlert: 'Please connect wallet first!',
      configureModels: 'Configure Models & API Key...',
      enterApiKey: 'Enter API Key to start...',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      confirm: 'Confirm',
      activeModels: 'Active Models',
      filterModels: 'Filter...',
      loadingModels: 'Loading models...',
      connectWallet: 'Connect Wallet',
      walletConnected: 'Wallet Connected',
      connected: 'BSC Network • Connected',
      disconnect: 'Disconnect',
      apiKey: 'API Key',
      apiKeyPlaceholder: 'sk-...',
      optionalIfConnected: 'Optional if Wallet Connected',
      configureApiKey: 'Please configure your API Key in Settings first',
      signToLogin: 'Sign to Login',
      todaysQuota: "Today's Quota",
      remainQuota: 'Remaining',
      balance: 'Balance',
      hodlBalance: 'HODL Balance',
      credits: 'Credits',
      current: 'Current',
      refreshStats: 'Refresh Stats',
      noResponse: 'No response received',
      loading: 'Loading...',
      close: 'Close',
      done: 'Done',
      selectModel: 'Select Model',
      searchOn: 'Search On',
      dropFiles: 'Drop files here',
      disclaimer: ''
    },
    create: {
      title: 'Initialize New Agent',
      subtitle: 'Define the identity, visual appearance, and core personality of your AI agent.',
      saveDraft: 'Save Draft',
      uploadBanner: 'Drag & drop or click to upload banner',
      uploadAvatar: 'Upload Avatar',
      coverLabel: 'Cover Image / Banner',
      steps: {
        core: 'Core Info',
        kb: 'Knowledge Base',
        logic: 'Logic Config',
        token: 'Tokenomics'
      },
      coreDetails: 'Core Details',
      agentName: 'Agent Name',
      agentNamePlaceholder: 'Agent Name',
      descPlaceholder: 'Agent description goes here...',
      category: 'Primary Category',
      categories: {
        defi: 'DeFi Trading',
        research: 'Research Assistant',
        content: 'Content Generation'
      },
      stats: 'Stats',
      winRate: 'Win Rate',
      earned: 'Earned',
      txs: 'TXs',
      bio: 'Bio / System Prompt',
      suggestion: 'AI Suggestion Available',
      level: 'LEVEL',
      type: 'Type',
      visibility: 'Visibility',
      public: 'Public',
      private: 'Private',
      required: 'Required',
      pending: 'PENDING',
      next: 'Next: Knowledge Base',
      estFee: 'Est. Creation Fee:',
      preview: 'Live Preview',
      visualIdentity: 'Visual Identity',
      words: 'words'
    },
    dashboard: {
      title: 'Dashboard',
      stats: {
        activeAgents: 'Active Agents',
        interactions: 'Interactions',
        credits: 'Total Credits',
        earned: 'Earned (BNB)',
        live: 'Live'
      },
      chartTitle: 'Activity Volume',
      rankingTitle: 'Top Agents (24h)'
    },
    footer: {
      desc: 'Empowering Web3 with Intelligence.',
      terms: 'Terms of Service',
      privacy: 'Privacy Policy',
      rights: 'All rights reserved.'
    },
    config: {
      title: 'API Configuration',
      customBaseUrl: 'Custom Base URL',
      customBaseUrlDesc: '',
      customApiKey: 'Custom API Key',
      customApiKeyDesc: 'Your API Key is stored locally in your browser.',
      appearance: 'Appearance',
      light: 'Light',
      dark: 'Dark',
      system: 'System',
      theme: 'Toggle Theme',
      language: 'Switch Language',
      languageLabel: 'Language',
      saveAndReload: 'Save & Reload',
      cancel: 'Cancel',
      settings: 'Settings'
    },
    errors: {
      connectionFailed: 'Failed to connect wallet',
      connectionCancelled: 'Connection cancelled by user',
      installWallet: 'Please install MetaMask or another Web3 wallet',
      sessionExpired: 'Session expired. Please reconnect your wallet.',
      rateLimited: 'Too many requests. Please wait a moment and try again.',
      insufficientCredits: 'Insufficient credits. Please top up your account.',
      aiResponseFailed: 'Failed to get response from AI.',
      invalidApiKey: 'Invalid API Key. Please check your settings.'
    }
  },
  zh: {
    nav: {
      chat: '对话',
      dashboard: '仪表盘',
      create: '创建智能体',
      rankings: '排行榜',
      connect: '连接钱包'
    },
    home: {
      sloganPrefix: '构建',
      sloganHighlight: '主权 AI 的未来',
      subtitle: 'BNB Chain 上的 Web3 原生智能。',
      startChat: '开始对话',
      live: 'BSC 主网已上线',
      connectLaunch: '连接以启动',
      stats: {
        agents: '智能体',
        messages: '消息数',
        avgCost: '平均成本'
      },
      description: '不要租赁智慧，要拥有产生智慧的资产。持有 $HODLAI 即可获得去中心化 AI 网关的永久访问权。',
      features: {
        title: '为什么选择 HodlAI Chat？',
        f1Title: 'Web3 原生登录',
        f1Desc: '忘记密码。使用现有的加密钱包（Metamask, TrustWallet 等）进行无缝认证。',
        f2Title: '更低廉的 AI 访问',
        f2Desc: '利用 BSC 的超低 Gas 费进行经济实惠的交互。使用稳定币或 BNB 按提示付费。',
        f3Title: '无代码智能体',
        f3Desc: '即时部署自定义 AI 智能体。通过简单的可视化界面定义个性、知识库和工具。'
      }
    },
    chat: {
      sidebarTitle: 'Web3 智能助手',
      newChat: '新对话',
      history: '历史记录',
      noHistory: '暂无历史记录',
      settings: '设置',
      placeholder: '问 Web3 智能助手任何问题...',
      send: '发送',
      webSearch: '联网搜索',
      attachFile: '上传文件',
      welcome: '今天有什么我可以帮您的？',
      suggestions: [
        '分析市场趋势',
        '解释零知识证明 (ZKP)',
        '编写 Solidity 智能合约',
        '调试这段 React 代码',
        '总结这份 PDF 文档',
        '解释量子计算',
        '写一个 Python 脚本',
        '写一首关于 AI 的诗'
      ],
      thinking: 'AI 正在思考...',
      copy: '复制',
      copied: '已复制!',
      regenerate: '重新生成',
      model: '模型：',
      today: '今天',
      yesterday: '昨天',
      previous7Days: '过去 7 天',
      previous: '更早',
      loginAlert: '请先连接钱包！',
      configureModels: '配置模型与 API Key...',
      enterApiKey: '输入 API Key 以开始...',
      save: '保存',
      cancel: '取消',
      delete: '删除',
      edit: '编辑',
      confirm: '确认',
      activeModels: '已选模型',
      filterModels: '搜索模型...',
      loadingModels: '正在加载模型列表...',
      connectWallet: '连接钱包',
      walletConnected: '钱包已连接',
      connected: 'BSC Network • 已连接',
      disconnect: '断开连接',
      apiKey: 'API Key',
      apiKeyPlaceholder: 'sk-...',
      optionalIfConnected: '已连接钱包 (自动鉴权)',
      configureApiKey: '请先在设置中配置您的 API 密钥',
      signToLogin: '签名以登录',
      todaysQuota: '今日额度',
      remainQuota: '剩余额度',
      balance: '余额',
      hodlBalance: 'HODL 余额',
      credits: '积分',
      current: '当前',
      refreshStats: '刷新数据',
      noResponse: '未收到回复',
      loading: '加载中...',
      close: '关闭',
      done: '完成',
      selectModel: '选择模型',
      searchOn: '已开启联网',
      dropFiles: '拖拽文件到此处',
      disclaimer: ''
    },
    create: {
      title: '初始化新智能体',
      subtitle: '定义 AI 智能体的身份、视觉外观和核心个性。',
      saveDraft: '保存草稿',
      uploadBanner: '拖拽或点击上传横幅',
      uploadAvatar: '上传头像',
      coverLabel: '封面图片 / 横幅',
      steps: {
        core: '核心信息',
        kb: '知识库',
        logic: '逻辑配置',
        token: '代币经济学'
      },
      coreDetails: '核心详情',
      agentName: '智能体名称',
      agentNamePlaceholder: '智能体名称',
      descPlaceholder: '在此输入智能体描述...',
      category: '主要分类',
      categories: {
        defi: 'DeFi 交易',
        research: '研究助手',
        content: '内容生成'
      },
      stats: '统计',
      winRate: '胜率',
      earned: '已赚取',
      txs: '交易数',
      bio: '简介 / 系统提示词',
      suggestion: '可用 AI 建议',
      level: '等级',
      type: '类型',
      visibility: '可见性',
      public: '公开',
      private: '私有',
      required: '必填',
      pending: '待定',
      next: '下一步：知识库',
      estFee: '预计创建费用：',
      preview: '实时预览',
      visualIdentity: '视觉身份',
      words: '字'
    },
    dashboard: {
      title: '仪表盘',
      stats: {
        activeAgents: '活跃智能体',
        interactions: '交互次数',
        credits: '总积分',
        earned: '已赚取 (BNB)',
        live: '运行中'
      },
      chartTitle: '活动量',
      rankingTitle: '热门智能体 (24小时)'
    },
    footer: {
      desc: '用智能赋能 Web3。',
      terms: '服务条款',
      privacy: '隐私政策',
      rights: '版权所有。'
    },
    config: {
      title: 'API 配置',
      customBaseUrl: '自定义 API 地址',
      customBaseUrlDesc: '',
      customApiKey: '自定义 API 密钥',
      customApiKeyDesc: '您的 API 密钥仅保存在本地浏览器中。',
      appearance: '外观',
      light: '亮色',
      dark: '暗色',
      system: '系统',
      theme: '切换主题',
      language: '切换语言',
      languageLabel: '语言',
      saveAndReload: '保存并刷新',
      cancel: '取消',
      settings: '设置'
    },
    errors: {
      connectionFailed: '钱包连接失败',
      connectionCancelled: '用户取消连接',
      installWallet: '请安装 MetaMask 或其他 Web3 钱包',
      sessionExpired: '会话已过期，请重新连接钱包。',
      rateLimited: '请求过于频繁，请稍后再试。',
      insufficientCredits: '积分不足，请充值。',
      aiResponseFailed: '获取 AI 回复失败。',
      invalidApiKey: 'API 密钥无效，请检查设置。'
    }
  }
};