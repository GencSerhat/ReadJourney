import * as Yup from "yup";

export const readingPageSchema = Yup.object({
  page: Yup.number()
    .typeError("Page must be a number")
    .integer("Page must be an integer")
    .min(1, "Page must be at least 1")
    .required("Page is required"),
});
