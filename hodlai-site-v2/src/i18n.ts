// src/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "nav_features": "Features",
      "nav_transparency": "Transparency",
      "nav_models": "Models",
      "nav_pricing": "Pricing",
      "nav_connect": "Connect Wallet",
      
      "hero_badge_web3": "Web3 × AI Integration",
      "hero_badge_transparency": "100% Transparent",
      "hero_title_prefix": "Hold $HODLAI",
      "hero_title_suffix": "Free AI API Forever",
      "hero_desc": "3% Tax funds the API pool. Access 200+ top models like GPT-5.2 & Claude 4.5.",
      "hero_models_tag": "AI Models",
      "hero_cost_ratio": "Daily Quota",
      "hero_diamond_tag": "Diamond Hands",
      "hero_hold_tag": "Lifetime Access",
      
      "panel_status_connected": "Connected",
      "panel_status_connect": "Connect Wallet for API Key",
      "panel_connect_title": "Connect to Get API Key",
      "panel_connect_desc": "Checking holding status on-chain. Secure signature, no gas fee.",
      "panel_connect_btn": "Connect Wallet",
      "panel_regen": "Regenerate",
      "panel_quota_today": "Today's Quota",
      "panel_quota_remain": "Remaining",
      "panel_hold_balance": "Balance",
      "panel_quota_ratio": "Ratio",
      "panel_secure_tip": "Secure Signature • No Gas Fee",
      
      "feat_badge": "Core Advantages",
      "feat_title": "Web2 & Web3 Fusion",
      "feat_tax_title": "Transaction Tax",
      "feat_tax_desc": "3% tax sustains the API pool.",
      "feat_asset_title": "Assets in Wallet",
      "feat_asset_desc": "No deposit required. Hold to access.",
      "feat_diamond_title": "Diamond Hands",
      "feat_diamond_desc": "Hold longer for 100% quota.",
      "feat_sdk_title": "Full Compatibility",
      "feat_sdk_desc": "OpenAI + Claude format supported.",
      "feat_models_title": "200+ Models",
      "feat_models_desc": "GPT-5, Gemini, DeepSeek access.",
      "feat_chain_title": "On-chain Verify",
      "feat_chain_desc": "Holdings verified on-chain.",
      
      "model_badge": "Top Tier Models",
      "model_title": "200+ AI Models",
      "model_view_all": "View Full List",
      
      "price_badge": "Rules",
      "price_title": "Hold Value = Daily Quota",
      "price_desc": "Dynamic pricing protects early holders. Lower price = Higher quota ratio.",
      "price_dynamic_title": "Dynamic Ratio",
      "price_dynamic_sub": "Auto-adjusts every $0.001 price tier",
      "price_diamond_title": "Diamond Hands",
      "price_diamond_1": "Never sold + 24h = 100% quota",
      "price_diamond_2": "Sold/Transferred = Cap at 80%",
      "price_diamond_3": "30min cooldown after selling",
    }
  },
  zh: {
    translation: {
      "nav_features": "项目优势",
      "nav_transparency": "透明公示",
      "nav_models": "AI 模型",
      "nav_pricing": "额度说明",
      "nav_connect": "连接钱包",
      
      "hero_badge_web3": "Web3 × AI 融合",
      "hero_badge_transparency": "资金透明",
      "hero_title_prefix": "持有$HODLAI",
      "hero_title_suffix": "AI API 永久免费",
      "hero_desc": "3% 交易税保障 API 资金池，200+ 顶级模型一站式调用。",
      "hero_models_tag": "AI 模型",
      "hero_cost_ratio": "每日额度",
      "hero_diamond_tag": "钻石手",
      "hero_hold_tag": "持有即享",
      
      "panel_status_connected": "已连接",
      "panel_status_connect": "连接钱包获取 API Key",
      "panel_connect_title": "连接钱包获取 API Key",
      "panel_connect_desc": "链上验证持仓状态。安全签名，无需 Gas 费。",
      "panel_connect_btn": "连接钱包",
      "panel_regen": "重新生成",
      "panel_quota_today": "今日额度",
      "panel_quota_remain": "剩余额度",
      "panel_hold_balance": "持有代币",
      "panel_quota_ratio": "当前比例",
      "panel_secure_tip": "安全签名 • 无需 Gas 费",
      
      "feat_badge": "核心优势",
      "feat_title": "Web2 与 Web3 的完美融合",
      "feat_tax_title": "交易税驱动",
      "feat_tax_desc": "每笔交易 3% 税费 进入资金池，可持续运作。",
      "feat_asset_title": "资产在你钱包",
      "feat_asset_desc": "无需充值托管，持有即权益，可随时交易。",
      "feat_diamond_title": "钻石手机制",
      "feat_diamond_desc": "持有越久额度越多，24h 达 100%。",
      "feat_sdk_title": "全接口兼容",
      "feat_sdk_desc": "OpenAI + Claude 格式全支持，全端点覆盖。",
      "feat_models_title": "200+ 顶级模型",
      "feat_models_desc": "GPT-5.2、Gemini、DeepSeek 等一站调用。",
      "feat_chain_title": "链上透明",
      "feat_chain_desc": "持有量、时间全部链上可验证。",
      
      "model_badge": "顶级模型",
      "model_title": "200+ AI 模型一键调用",
      "model_view_all": "查看全部模型",
      
      "price_badge": "额度规则",
      "price_title": "持仓价值 = 每日免费额度",
      "price_desc": "动态定价机制：币价越低额度比例越高，保护低位持有者。",
      "price_dynamic_title": "动态额度比例",
      "price_dynamic_sub": "币价每变动 $0.001 档位自动调整",
      "price_diamond_title": "钻石手机制",
      "price_diamond_1": "从未卖出 + 24h = 100% 额度",
      "price_diamond_2": "曾卖出/转出 = 最高 80%",
      "price_diamond_3": "卖出后有 30 分钟冷却期",
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "zh",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
