// 联系表单处理
document.addEventListener('DOMContentLoaded', () => {
  const contactForm = document.getElementById('contactForm');
  
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData(contactForm);
      const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        subject: formData.get('subject'),
        message: formData.get('message'),
      };
      
      // 基本验证
      if (!data.name || !data.email || !data.message) {
        alert('请填写所有必填字段');
        return;
      }
      
      // 邮箱验证
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        alert('请输入有效的邮箱地址');
        return;
      }
      
      try {
        // 这里可以替换为实际的 API 端点
        // const response = await fetch('/api/contact', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(data),
        // });
        
        console.log('表单数据：', data);
        alert('感谢您的消息！我们会尽快回复。');
        contactForm.reset();
      } catch (error) {
        console.error('表单提交失败:', error);
        alert('提交失败，请稍后重试');
      }
    });
  }
});
