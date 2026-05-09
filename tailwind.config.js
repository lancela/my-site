/**
 * ========================================
 * Tailwind CSS 配置文件
 * ========================================
 * 
 * Tailwind CSS 是一个实用优先 (Utility-First) 的 CSS 框架
 * 它提供了丰富的预设类名，可以直接在 HTML 中组合使用
 * 
 * 主要特点：
 * 1. 无需编写自定义 CSS，直接使用预定义工具类
 * 2. 自动清除未使用的 CSS，减小文件大小
 * 3. 高度可定制的主题配置
 * 4. 响应式设计支持 (mobile-first)
 * 5. 支持 dark 模式和其他变体
 * 
 * 使用示例：
 * <div class="bg-blue-500 text-white p-4 rounded-lg">
 *   这是一个蓝色背景、白色文字、内边距为 1rem、圆角的容器
 * </div>
 */

/** @type {import('tailwindcss').Config} */
export default {
  /**
   * content: 需要扫描的文件路径
   * 
   * Tailwind CSS 会扫描这些文件中的 class 属性
   * 并生成相应的 CSS 代码。只有实际使用过的类名才会被包含
   * 
   * 通配符说明：
   * - *.html: 所有 HTML 文件
   * - *.js: 所有 JavaScript 文件（可能动态生成 class）
   * - **: 递归匹配所有子目录
   * - {html,js}: 匹配 HTML 或 JS 文件
   * 
   * 为什么需要明确指定？
   * - Tailwind 需要知道扫描哪些文件来生成 CSS
   * - 如果遗漏某些文件，其中的样式可能不被生成
   * - 减少不必要的扫描可以加快构建速度
   */
  content: [
    "./src/pages/**/*.{html,js}",    // 所有页面文件
    "./src/layouts/**/*.html",        // 所有布局模板
    "./src/js/**/*.js",               // 所有 JavaScript 文件
  ],
  
  /**
   * theme: 自定义主题配置
   * 
   * 主题定义了整个项目使用的设计令牌
   * 如颜色、字体、间距、断点等
   */
  theme: {
    /**
     * extend: 扩展默认主题
     * 
     * extend 用于添加自定义配置，而不是覆盖默认配置
     * 这样可以保留 Tailwind 的所有默认值，同时添加自定义内容
     * 
     * 与直接定义 theme 的区别：
     * - theme.colors: 覆盖所有默认颜色
     * - theme.extend.colors: 添加新颜色，保留默认颜色
     */
    extend: {
      /**
       * fontFamily: 字体配置
       * 
       * 定义可在项目中使用的字体
       * Tailwind 默认使用一个系统字体堆栈
       * 
       * 使用方法：
       * <div class="font-sans">使用 Inter 字体</div>
       * 
       * 字体堆栈的作用：
       * 1. Inter: 首选字体（需要在 CSS 中导入或使用 @import）
       * 2. sans-serif: 降级方案（系统默认无衬线字体）
       * 
       * 为什么需要堆栈？
       * - 如果 Inter 字体加载失败，浏览器会使用 sans-serif
       * - 确保页面始终有可用的字体显示
       */
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  
  /**
   * plugins: Tailwind 插件
   * 
   * 插件是 JavaScript 函数，可以为 Tailwind 添加新功能
   * 常见用途：
   * - 添加新的工具类
   * - 注册新的变体
   * - 提供组件类
   * 
   * 当前项目未使用额外插件
   */
  plugins: [],
}