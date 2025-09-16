/**
 * 无障碍访问工具函数
 * Accessibility utility functions for consistent ARIA label handling
 */

export interface AriaLabelOptions {
  /** 基础标签文本 */
  baseLabel: string;
  /** 当前状态 */
  currentState?: string;
  /** 是否已选择/激活 */
  isActive?: boolean;
  /** 额外的上下文信息 */
  context?: string;
}

/**
 * 生成标准化的 ARIA 标签
 * Generate standardized ARIA labels for interactive elements
 */
export function generateAriaLabel({ 
  baseLabel, 
  currentState, 
  isActive, 
  context 
}: AriaLabelOptions): string {
  let label = baseLabel;
  
  if (context) {
    label = `${context}：${label}`;
  }
  
  if (currentState) {
    label += `，${currentState}`;
  }
  
  if (isActive !== undefined) {
    label += isActive ? '，已选择' : '';
  }
  
  return label;
}

/**
 * 常用的无障碍访问标签
 * Common accessibility labels for consistent usage
 */
export const AccessibilityLabels = {
  // 按钮操作
  buttons: {
    confirm: '确认',
    cancel: '取消',
    close: '关闭',
    edit: '编辑',
    delete: '删除',
    submit: '提交',
    send: '发送',
    interrupt: '停止生成',
    like: '点赞',
    dislike: '点踩',
    share: '分享',
    copy: '复制',
  },
  
  // 状态描述
  states: {
    selected: '已选择',
    pressed: '已按下',
    expanded: '已展开',
    collapsed: '已收起',
    loading: '加载中',
    disabled: '已禁用',
    required: '必填项',
    optional: '选填项',
  },
  
  // 内容区域
  regions: {
    navigation: '导航',
    main: '主要内容',
    sidebar: '侧边栏',
    toolbar: '工具栏',
    form: '表单',
    dialog: '对话框',
    menu: '菜单',
  },
  
  // 交互提示
  interactions: {
    clickToEdit: '点击编辑',
    clickToExpand: '点击展开',
    clickToCollapse: '点击收起',
    pressEnterOrSpace: '按 Enter 或空格键激活',
    dragAndDrop: '拖拽文件到此区域',
  },
  
  // 反馈相关
  feedback: {
    difficulty: {
      table: '表格难易度',
      question: '提问难易度',
    },
    type: '提问类型',
    tags: '反馈标签',
    comment: '反馈详细说明',
  },
} as const;

/**
 * 为键盘导航生成标准化的事件处理器
 * Generate standardized keyboard event handlers for navigation
 */
export function createKeyboardHandler(callback: () => void) {
  return (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      callback();
    }
  };
}

/**
 * 为可切换元素生成 ARIA 属性
 * Generate ARIA attributes for toggleable elements
 */
export function getToggleAriaProps(isToggled: boolean, label: string) {
  return {
    role: 'button' as const,
    tabIndex: 0,
    'aria-pressed': isToggled,
    'aria-label': generateAriaLabel({ 
      baseLabel: label, 
      isActive: isToggled 
    }),
  };
}

/**
 * 为可展开元素生成 ARIA 属性
 * Generate ARIA attributes for expandable elements
 */
export function getExpandableAriaProps(isExpanded: boolean, contentLabel: string) {
  return {
    role: 'button' as const,
    tabIndex: 0,
    'aria-expanded': isExpanded,
    'aria-label': `${isExpanded ? '收起' : '展开'}${contentLabel}`,
  };
}
