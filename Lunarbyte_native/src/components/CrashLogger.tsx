import { useEffect } from "react"
import { Platform, NativeModules, Alert } from "react-native"
import * as FileSystem from "expo-file-system"

/**
 * 全局崩溃日志捕获器
 * - 捕获 JS 全局未处理异常
 * - 捕获 Promise 未处理 rejection
 * - 自动写入手机存储根目录 /storage/emulated/0/crash.log
 * - 同时弹窗显示错误信息便于调试
 */
export default function CrashLogger() {
  useEffect(() => {
    const logDir = Platform.OS === "android"
      ? "/storage/emulated/0/"
      : FileSystem.documentDirectory

    const logPath = `${logDir}wavemusic_crash.log`

    const appendLog = async (type: string, error: Error | string, stack?: string) => {
      const timestamp = new Date().toISOString()
      const deviceInfo = `
Platform: ${Platform.OS} ${Platform.Version}
Device: ${Platform.constants?.Brand || "unknown"} ${Platform.constants?.Manufacturer || ""}
Model: ${Platform.constants?.Device || "unknown"}
React Native: ${Platform.constants?.reactNativeVersion || "unknown"}
Expo SDK: ${Platform.constants?.expoVersion || "unknown"}
      `.trim()

      const logEntry = `
${"=".repeat(60)}
CRASH LOG - ${timestamp}
${"=".repeat(60)}
Type: ${type}
Device Info:
${deviceInfo}

Error:
${error instanceof Error ? error.message : error}

Stack Trace:
${stack || (error instanceof Error ? error.stack : "N/A")}
${"=".repeat(60)}

`
      try {
        const existing = await FileSystem.readAsStringAsync(logPath).catch(() => "")
        await FileSystem.writeAsStringAsync(logPath, existing + logEntry)
        // eslint-disable-next-line no-console
        console.log(`[CrashLogger] Log saved to: ${logPath}`)
      } catch (writeError) {
        // eslint-disable-next-line no-console
        console.error("[CrashLogger] Failed to write log:", writeError)
      }
    }

    // 1. 捕获全局未处理异常
    const errorHandler = (error: Error, isFatal: boolean) => {
      appendLog(
        isFatal ? "FATAL_ERROR" : "ERROR",
        error,
        error.stack
      )
      Alert.alert(
        "应用发生错误",
        `类型: ${isFatal ? "致命错误" : "错误"}\n${error.message}\n\n日志已保存到: ${logPath}`,
        [{ text: "确定" }]
      )
      // 返回 false 让默认的错误处理器也执行
      return false
    }

    // 2. 捕获未处理的 Promise rejection
    const rejectionHandler = (reason: Error | string) => {
      const msg = reason instanceof Error ? reason.message : String(reason)
      const stack = reason instanceof Error ? reason.stack : "N/A"
      appendLog("UNHANDLED_PROMISE_REJECTION", msg, stack)
    }

    // 3. 捕获原生异常（Android only）
    const handleNativeException = () => {
      if (Platform.OS === "android") {
        // 使用 ErrorUtils 捕获全局异常
        const globalAny = global as any
        const originalHandler = globalAny.ErrorUtils?.getGlobalHandler?.()

        if (globalAny.ErrorUtils?.setGlobalHandler) {
          globalAny.ErrorUtils.setGlobalHandler((error: Error, isFatal: boolean) => {
            appendLog(
              isFatal ? "NATIVE_FATAL_ERROR" : "NATIVE_ERROR",
              error,
              error.stack
            )
            Alert.alert(
              "原生层发生错误",
              `类型: ${isFatal ? "致命错误" : "错误"}\n${error.message}\n\n日志已保存到: ${logPath}`,
              [{ text: "确定" }]
            )
            // 调用原始处理器
            if (originalHandler) {
              originalHandler(error, isFatal)
            }
          })
        }
      }
    }

    // 设置所有错误处理器
    handleNativeException()

    if (global.ErrorUtils) {
      global.ErrorUtils.setGlobalHandler(errorHandler)
    }

    // 监听 unhandledrejection
    if (typeof window !== "undefined") {
      window.addEventListener("unhandledrejection", (event: any) => {
        rejectionHandler(event.reason)
      })
    } else {
      // RN 环境下用自定义方式
      const originalConsoleError = console.error
      console.error = (...args: unknown[]) => {
        originalConsoleError.apply(console, args)
        const errorStr = args.map(String).join(" ")
        if (errorStr.includes("unhandled") || errorStr.includes("rejection")) {
          rejectionHandler(new Error(errorStr))
        }
      }
    }

    // 写入启动日志
    appendLog("APP_START", "应用启动", new Error().stack)

    return () => {
      // 清理（实际上不会执行到，因为 App 崩溃了）
      appendLog("APP_EXIT", "应用退出（正常或异常）", new Error().stack)
    }
  }, [])

  return null
}
