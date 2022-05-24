// 清空表单
function clearForm (obj, formRef) {
  Object.keys(obj).forEach((key) => (obj[key] = ""))
  if (formRef) {
    formRef.value.restoreValidation()
  }
}

export { clearForm }
