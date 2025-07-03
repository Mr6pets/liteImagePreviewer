const themes = {
    default: {
        name: '默认主题',
        icon: '🌈',
        colors: {
            primary: '#667eea',
            secondary: '#764ba2',
            accent: '#f093fb',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
            cardBg: 'rgba(255, 255, 255, 0.95)',
            textPrimary: '#2d3748',
            textSecondary: '#718096'
        }
    },
    dark: {
        name: '暗黑主题',
        icon: '🌙',
        colors: {
            primary: '#1a202c',
            secondary: '#2d3748',
            accent: '#4a5568',
            background: 'linear-gradient(135deg, #1a202c 0%, #2d3748 50%, #4a5568 100%)',
            cardBg: 'rgba(45, 55, 72, 0.95)',
            textPrimary: '#f7fafc',
            textSecondary: '#e2e8f0'
        }
    },
    ocean: {
        name: '海洋主题',
        icon: '🌊',
        colors: {
            primary: '#0ea5e9',
            secondary: '#0284c7',
            accent: '#06b6d4',
            background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 50%, #06b6d4 100%)',
            cardBg: 'rgba(255, 255, 255, 0.95)',
            textPrimary: '#0f172a',
            textSecondary: '#475569'
        }
    },
    sunset: {
        name: '日落主题',
        icon: '🌅',
        colors: {
            primary: '#f97316',
            secondary: '#ea580c',
            accent: '#dc2626',
            background: 'linear-gradient(135deg, #f97316 0%, #ea580c 50%, #dc2626 100%)',
            cardBg: 'rgba(255, 255, 255, 0.95)',
            textPrimary: '#1f2937',
            textSecondary: '#6b7280'
        }
    },
    forest: {
        name: '森林主题',
        icon: '🌲',
        colors: {
            primary: '#059669',
            secondary: '#047857',
            accent: '#065f46',
            background: 'linear-gradient(135deg, #059669 0%, #047857 50%, #065f46 100%)',
            cardBg: 'rgba(255, 255, 255, 0.95)',
            textPrimary: '#064e3b',
            textSecondary: '#6b7280'
        }
    }
};

class ThemeManager {
    constructor() {
        this.currentTheme = localStorage.getItem('selectedTheme') || 'default';
        this.init();
    }

    init() {
        this.createThemeSelector();
        this.applyTheme(this.currentTheme);
    }

    createThemeSelector() {
        const header = document.querySelector('.header');
        const themeSelector = document.createElement('div');
        themeSelector.className = 'theme-selector';
        themeSelector.innerHTML = `
            <button class="theme-toggle-btn" title="切换主题">
                <span class="theme-icon">${themes[this.currentTheme].icon}</span>
                <span class="theme-text">主题</span>
            </button>
            <div class="theme-dropdown">
                ${Object.entries(themes).map(([key, theme]) => `
                    <button class="theme-option ${key === this.currentTheme ? 'active' : ''}" data-theme="${key}">
                        <span class="theme-option-icon">${theme.icon}</span>
                        <span class="theme-option-name">${theme.name}</span>
                    </button>
                `).join('')}
            </div>
        `;

        // 添加样式 - 使用CSS变量以支持动态主题
        const style = document.createElement('style');
        style.textContent = `
            .theme-selector {
                position: absolute;
                top: 20px;
                right: 20px;
                z-index: 1000;
            }

            .theme-toggle-btn {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 12px 16px;
                border: 1px solid;
                border-radius: 12px;
                cursor: pointer;
                font-weight: 600;
                transition: all 0.3s ease;
                backdrop-filter: blur(10px);
            }

            .theme-toggle-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
            }

            .theme-dropdown {
                position: absolute;
                top: 100%;
                right: 0;
                margin-top: 8px;
                border-radius: 12px;
                padding: 8px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
                backdrop-filter: blur(10px);
                border: 1px solid;
                opacity: 0;
                visibility: hidden;
                transform: translateY(-10px);
                transition: all 0.3s ease;
                min-width: 160px;
            }

            .theme-selector:hover .theme-dropdown {
                opacity: 1;
                visibility: visible;
                transform: translateY(0);
            }

            .theme-option {
                display: flex;
                align-items: center;
                gap: 12px;
                width: 100%;
                padding: 10px 12px;
                border: none;
                background: transparent;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s ease;
                font-weight: 500;
            }

            .theme-option:hover {
                background: var(--theme-option-hover, rgba(0, 0, 0, 0.05));
                transform: translateX(4px);
            }

            .theme-option.active {
                background: rgba(102, 126, 234, 0.1);
                color: #667eea !important;
            }

            .theme-option-icon {
                font-size: 18px;
            }
        `;
        document.head.appendChild(style);

        header.appendChild(themeSelector);

        // 绑定事件
        themeSelector.addEventListener('click', (e) => {
            if (e.target.closest('.theme-option')) {
                const themeKey = e.target.closest('.theme-option').dataset.theme;
                this.switchTheme(themeKey);
            }
        });
    }

    applyTheme(themeKey) {
        const theme = themes[themeKey];
        if (!theme) return;

        const root = document.documentElement;

        // 更新CSS变量
        root.style.setProperty('--primary-color', theme.colors.primary);
        root.style.setProperty('--secondary-color', theme.colors.secondary);
        root.style.setProperty('--accent-color', theme.colors.accent);
        root.style.setProperty('--card-bg', theme.colors.cardBg);
        root.style.setProperty('--text-primary', theme.colors.textPrimary);
        root.style.setProperty('--text-secondary', theme.colors.textSecondary);

        // 更新背景
        document.body.style.background = theme.colors.background;
        document.body.style.backgroundAttachment = 'fixed';

        // 更新主题选择器样式
        this.updateThemeSelectorStyles(themeKey, theme);

        // 更新标题渐变
        const titleElement = document.querySelector('.header h1');
        if (titleElement) {
            titleElement.style.background = this.getTitleGradient(theme.colors, themeKey);
            titleElement.style.webkitBackgroundClip = 'text';
            titleElement.style.webkitTextFillColor = 'transparent';
            titleElement.style.backgroundClip = 'text';
            titleElement.style.textShadow = '0 2px 4px rgba(0, 0, 0, 0.2)';

            titleElement.style.position = 'relative';
            titleElement.style.zIndex = '2';

            // 根据主题动态调整背景板
            let backdrop = titleElement.querySelector('.title-backdrop');
            if (!backdrop) {
                backdrop = document.createElement('div');
                backdrop.className = 'title-backdrop';
                titleElement.appendChild(backdrop);
            }

            // 根据主题选择背景板颜色
            const backdropColors = {
                default: 'rgba(255, 255, 255, 0.08)',
                dark: 'rgba(255, 255, 255, 0.05)',
                ocean: 'rgba(0, 0, 0, 0.1)',
                sunset: 'rgba(0, 0, 0, 0.08)',
                forest: 'rgba(0, 0, 0, 0.1)'
            };

            backdrop.style.cssText = `
                position: absolute;
                top: -8px;
                left: -16px;
                right: -16px;
                bottom: -8px;
                background: ${backdropColors[themeKey] || backdropColors.default};
                border-radius: 16px;
                z-index: -1;
            `;
        }
    }

    // 新增方法：更新主题选择器样式
    updateThemeSelectorStyles(themeKey, theme) {
        const themeToggleBtn = document.querySelector('.theme-toggle-btn');
        const themeDropdown = document.querySelector('.theme-dropdown');
        const themeOptions = document.querySelectorAll('.theme-option');

        if (!themeToggleBtn || !themeDropdown) return;

        // 根据主题定义样式
        const selectorStyles = {
            default: {
                btnBg: 'rgba(255, 255, 255, 0.9)',
                btnBorder: 'rgba(255, 255, 255, 0.3)',
                btnColor: '#2d3748',
                dropdownBg: 'rgba(255, 255, 255, 0.95)',
                dropdownBorder: 'rgba(255, 255, 255, 0.3)',
                optionHover: 'rgba(0, 0, 0, 0.05)'
            },
            dark: {
                btnBg: 'rgba(45, 55, 72, 0.9)',
                btnBorder: 'rgba(255, 255, 255, 0.2)',
                btnColor: '#f7fafc',
                dropdownBg: 'rgba(45, 55, 72, 0.95)',
                dropdownBorder: 'rgba(255, 255, 255, 0.2)',
                optionHover: 'rgba(255, 255, 255, 0.1)'
            },
            ocean: {
                btnBg: 'rgba(255, 255, 255, 0.9)',
                btnBorder: 'rgba(255, 255, 255, 0.3)',
                btnColor: '#0f172a',
                dropdownBg: 'rgba(255, 255, 255, 0.95)',
                dropdownBorder: 'rgba(255, 255, 255, 0.3)',
                optionHover: 'rgba(0, 0, 0, 0.05)'
            },
            sunset: {
                btnBg: 'rgba(255, 255, 255, 0.9)',
                btnBorder: 'rgba(255, 255, 255, 0.3)',
                btnColor: '#1f2937',
                dropdownBg: 'rgba(255, 255, 255, 0.95)',
                dropdownBorder: 'rgba(255, 255, 255, 0.3)',
                optionHover: 'rgba(0, 0, 0, 0.05)'
            },
            forest: {
                btnBg: 'rgba(255, 255, 255, 0.9)',
                btnBorder: 'rgba(255, 255, 255, 0.3)',
                btnColor: '#064e3b',
                dropdownBg: 'rgba(255, 255, 255, 0.95)',
                dropdownBorder: 'rgba(255, 255, 255, 0.3)',
                optionHover: 'rgba(0, 0, 0, 0.05)'
            }
        };

        const styles = selectorStyles[themeKey] || selectorStyles.default;

        // 更新按钮样式
        themeToggleBtn.style.background = styles.btnBg;
        themeToggleBtn.style.borderColor = styles.btnBorder;
        themeToggleBtn.style.color = styles.btnColor;

        // 更新下拉菜单样式
        themeDropdown.style.background = styles.dropdownBg;
        themeDropdown.style.borderColor = styles.dropdownBorder;

        // 更新选项样式
        themeOptions.forEach(option => {
            option.style.color = styles.btnColor;
        });

        // 更新CSS变量用于hover效果
        const root = document.documentElement;
        root.style.setProperty('--theme-option-hover', styles.optionHover);
    }

    getTitleGradient(colors, themeKey) {
        // 为每个主题定制更炫酷的标题渐变
        const titleGradients = {
            default: 'linear-gradient(135deg, #ff6b6b 0%, #feca57 50%, #ff9ff3 100%)',
            dark: 'linear-gradient(135deg, #a29bfe 0%, #74b9ff 50%, #81ecec 100%)',
            ocean: 'linear-gradient(135deg, #00cec9 0%, #0984e3 50%, #6c5ce7 100%)',
            sunset: 'linear-gradient(135deg, #ff9f43 0%, #ee5253 50%, #6f1e51 100%)',
            forest: 'linear-gradient(135deg, #1dd1a1 0%, #10ac84 50%, #2e86de 100%)'
        };
    
        return titleGradients[themeKey] || titleGradients.default;
    }

    switchTheme(themeKey) {
        this.currentTheme = themeKey;
        localStorage.setItem('selectedTheme', themeKey);
        this.applyTheme(themeKey);

        // 更新按钮图标
        const themeIcon = document.querySelector('.theme-icon');
        if (themeIcon) {
            themeIcon.textContent = themes[themeKey].icon;
        }

        // 更新活动状态
        document.querySelectorAll('.theme-option').forEach(option => {
            option.classList.toggle('active', option.dataset.theme === themeKey);
        });

        // 添加切换动画
        document.body.style.transition = 'all 0.5s ease';
        setTimeout(() => {
            document.body.style.transition = '';
        }, 500);
    }
}

// 导出供其他文件使用
window.ThemeManager = ThemeManager;
