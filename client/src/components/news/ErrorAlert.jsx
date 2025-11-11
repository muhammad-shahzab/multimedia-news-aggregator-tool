import { Alert } from "@mui/material"

const ErrorAlert = ({ error }) =>
  error ? <Alert severity="error" className="m-4">{error}</Alert> : null

export default ErrorAlert
