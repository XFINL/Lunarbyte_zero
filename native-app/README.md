# Wave Music Native

基于现有 Web 项目重建的 `React Native + React Navigation + Expo` 安卓原生端。

## 已完成

- 底部导航：`搜索 / 首页 / 我的`
- 栈路由：`点赞列表 / 设置 / 通用设置 / 实验功能 / 语言设置 / 关于我们`
- 状态管理：`Zustand`
- 本地持久化：`AsyncStorage`
- 音频播放：`expo-av`
- Android 原生工程：已通过 `expo prebuild` 生成 `android/`

## 常用命令

```bash
npm install
npm run typecheck
npm run start
npm run prebuild:android
npm run android:release
```

## 构建前提

需要本机已安装并配置：

- `JDK 17`
- `Android SDK`
- `ANDROID_HOME` 或 `ANDROID_SDK_ROOT`
- 可访问 Gradle 分发地址 `https://services.gradle.org/`

推荐环境变量示例：

```bash
export JAVA_HOME=/path/to/jdk-17
export ANDROID_HOME=/path/to/android-sdk
export ANDROID_SDK_ROOT=/path/to/android-sdk
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$PATH"
```

## 当前已验证

- `npm run typecheck` 通过
- `npm run prebuild:android` 通过

## 当前阻塞

当前沙箱环境构建 `release` 时，Gradle Wrapper 下载超时，且未配置 Android SDK，因此未能在此环境产出最终 `apk/aab`。
