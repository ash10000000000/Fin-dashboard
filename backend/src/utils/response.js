function success(data) {
  return {
    success: true,
    data,
  };
}

function validationErrors(errors) {
  return {
    success: false,
    errors,
  };
}

function zodToFieldErrors(error) {
  const errors = error.errors.map((issue) => {
    const field = issue.path.length > 0 ? issue.path.join('.') : 'root';
    return { field, message: issue.message };
  });
  return validationErrors(errors);
}

module.exports = {
  success,
  validationErrors,
  zodToFieldErrors,
};
