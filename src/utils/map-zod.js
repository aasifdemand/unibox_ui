export const mapZodErrors = (zodError) => {
  if (!zodError || !Array.isArray(zodError.issues)) {
    return {};
  }

  const fieldErrors = {};

  zodError.issues.forEach((issue) => {
    const field = issue.path?.[0];
    if (field) {
      fieldErrors[field] = issue.message;
    }
  });

  return fieldErrors;
};
