# 🍕 Pizza App

A modern, multi-language Ionic/Angular application for calculating and managing poolish-style pizza recipes. Built with the latest web technologies and featuring a beautiful, responsive UI.

## ✨ Features

### 🍕 **Pizza Recipe Management**
- **Poolish-style pizza calculations** with precise ingredient ratios
- **Dynamic recipe generation** based on number of pizzas and preferences
- **Professional cooking instructions** with step-by-step guidance
- **Ingredient calculations** with weights and percentages
- **Multiple yeast types** support (dry and fresh yeast)

### 🌍 **Multi-Language Support**
- **2 Languages**: English, French
- **Dynamic language switching** at runtime
- **Localized content** for all app sections
- **Automatic language detection** based on browser/device settings
- **Persistent language preferences** stored locally

### 🎨 **Modern UI/UX**
- **Ionic Framework** components for native-like experience
- **Responsive design** that works on all devices
- **Beautiful animations** and smooth transitions
- **Intuitive navigation** with tab-based interface
- **Professional cooking app aesthetics**

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js (v18 or higher)
- npm (v8 or higher)
- Ionic CLI (optional, for additional commands)

### **Installation**
```bash
# Clone the repository
git clone <your-repo-url>
cd pizza-app

# Install dependencies
npm install
```

### **Development**
```bash
# Start development server
npm start

# The app will open in your browser at http://localhost:4200
```

### **Building for Production**
```bash
# Build for production
npm run build

# Build for specific platform (Android/iOS)
npm run build:android
npm run build:ios
```

### **Mobile Development**
```bash
# Add Android platform
ionic capacitor add android

# Add iOS platform (macOS only)
ionic capacitor add ios

# Sync web code to native platforms
ionic capacitor sync

# Open in native IDE
ionic capacitor open android
ionic capacitor open ios
```

## 🏗️ **Project Structure**

```
pizza-app/
├── src/
│   ├── app/
│   │   ├── features/
│   │   │   └── dough/                     # Dough recipe feature
│   │   │       ├── dough-form/                # Recipe form component
│   │   │       ├── dough-poolish-recipe/      # Recipe display component
│   │   │       └── dough-quantity/            # Calculation results
│   │   ├── shared/
│   │   │   ├── components/
│   │   │   │   ├── language-switcher/       # Language selection
│   │   │   │   └── toolbar-segments/        # Navigation segments
│   │   │   └── services/
│   │   │       └── translation-keys.service.ts  # Translation management
│   │   └── tabs/                          # Main navigation tabs
│   ├── assets/
│   │   └── i18n/                          # Translation files (per-language folders)
│   │       ├── en/                         # English translations
│   │       └── fr/                         # French translations
│   └── locale/                             # Angular i18n files (legacy)
├── android/                                # Android native code
├── ios/                                    # iOS native code (if added)
└── capacitor.config.ts                     # Capacitor configuration
```

## 🌍 **Internationalization (i18n)**

### **Translation System**
- **ngx-translate** for runtime language switching
- **JSON-based translation files** in `src/assets/i18n/`
- **Centralized translation keys** via `TranslationKeys` service
- **Type-safe translation management** with TypeScript

### **Supported Languages**
| Language | Code | Flag | Status |
|----------|------|------|--------|
| English  | `en` | 🇺🇸 | ✅ Complete |
| French   | `fr` | 🇫🇷 | ✅ Complete |

Since v2.0, the app ships French and English only; a v1 user whose
persisted language was de/es/it falls back to English (or French on a
French-speaking device) on first launch.

### **Adding New Languages**
1. Create the domain files: `src/assets/i18n/[lang]/{common,pages,calculator,faq,settings}.json`
2. Add the language to the `Locales` enum (`src/app/features/settings/enums/locales.enum.ts`) — the settings selector derives from it
3. Map the locale in `LocaleManagerService` (`loadLocaleData`, `getCurrentAngularLocale`)
4. Add the selector label under `form.system.language` in every language's `settings.json`

## 🍕 **Pizza Recipe Features**

### **Poolish Method**
- **Traditional Italian technique** for superior pizza dough
- **Pre-fermentation** for enhanced flavor and texture
- **Scientific approach** to ingredient ratios
- **Professional cooking instructions**

### **Recipe Components**
- **Form**: Input number of pizzas, yeast type, hydration, temperature
- **Calculations**: Precise ingredient weights and percentages
- **Recipe**: Step-by-step cooking instructions
- **Results**: Summary of all calculations

### **Ingredients Supported**
- **Flour**: Base ingredient with customizable ratios
- **Water**: Hydration percentage calculations
- **Yeast**: Dry and fresh yeast options
- **Honey**: Natural sweetener for fermentation
- **Salt**: Flavor enhancement and dough structure

## 🛠️ **Technology Stack**

### **Frontend Framework**
- **Angular 17+** with standalone components
- **Ionic Framework 7+** for mobile-first UI
- **TypeScript** for type safety
- **SCSS** for advanced styling

### **Build Tools**
- **Angular CLI** for development and building
- **Capacitor** for native mobile deployment
- **Webpack** for bundling and optimization

### **Internationalization**
- **ngx-translate** for runtime translations
- **JSON translation files** for easy maintenance
- **TypeScript interfaces** for translation keys

### **Mobile Development**
- **Capacitor** for native platform integration
- **Android Studio** for Android development
- **Xcode** for iOS development (macOS only)

## 📱 **Platform Support**

### **Web**
- **Modern browsers** (Chrome, Firefox, Safari, Edge)
- **Progressive Web App** capabilities
- **Responsive design** for all screen sizes

### **Mobile**
- **Android 6.0+** (API level 23+)
- **iOS 13+** (iPhone and iPad)
- **Native performance** with Capacitor

### **Desktop**
- **Windows, macOS, Linux** via web browser
- **Electron** support (can be added)

## 🚀 **Deployment**

### **Web Deployment**
```bash
# Build for production
npm run build

# Deploy to your hosting service
# (Netlify, Vercel, Firebase Hosting, etc.)
```

### **Mobile App Stores**
```bash
# Build native apps
ionic capacitor build android
ionic capacitor build ios

# Follow platform-specific deployment guides
# Google Play Console for Android
# App Store Connect for iOS
```

## 🔧 **Configuration**

### **Environment Variables**
- `environment.ts` - Development configuration
- `environment.prod.ts` - Production configuration

### **Capacitor Configuration**
- `capacitor.config.ts` - Native platform settings
- Android and iOS specific configurations

### **Translation Configuration**
- `src/assets/i18n/` - Translation file locations
- `TranslationKeys` service - Centralized key management

## 📚 **Development Guidelines**

### **Code Style**
- **Angular style guide** compliance
- **TypeScript strict mode** enabled
- **ESLint** for code quality
- **Prettier** for code formatting

### **Component Architecture**
- **Standalone components** (Angular 17+)
- **Feature-based organization**
- **Shared services** for common functionality
- **Lazy loading** for optimal performance

### **Testing**
- **Unit tests** with Jasmine/Karma
- **E2E tests** with Playwright (can be added)
- **Component testing** best practices

## 🤝 **Contributing**

1. **Fork** the repository
2. **Create** a feature branch
3. **Make** your changes
4. **Test** thoroughly
5. **Submit** a pull request

### **Translation Contributions**
- Follow existing translation structure
- Use professional cooking terminology
- Maintain consistency across languages
- Test with native speakers when possible

## 📄 **License**

[Your License Here]

## 🙏 **Acknowledgments**

- **Ionic Framework** team for the amazing mobile UI components
- **Angular** team for the robust web framework
- **ngx-translate** contributors for internationalization support
- **Pizza enthusiasts** worldwide for recipe inspiration

---

**Made with ❤️ and 🍕 by [Bryo]**

*For questions, issues, or contributions, please open an issue or pull request.*
