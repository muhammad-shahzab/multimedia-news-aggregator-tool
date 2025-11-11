import { Typography } from "@mui/material"

const EmptyState = () => (
  <div className="text-center py-12">
    <Typography variant="h6" className="text-gray-500 mb-2">No articles found</Typography>
    <Typography variant="body2" className="text-gray-400">Try adjusting your search or category filter</Typography>
  </div>
)

export default EmptyState
