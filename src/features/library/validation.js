import * as Yup from "yup";

export const addBookSchema = Yup.object({
  title: Yup.string().trim().required("Title is required"),
  author: Yup.string().trim().required("Author is required"),
  totalPages: Yup.number()
    .typeError("Total pages must be a number")
    .integer("Total pages must be an integer")
    .min(1, "Total pages must be at least 1")
    .required("Total pages is required"),
});
