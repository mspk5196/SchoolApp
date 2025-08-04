// Add this route to your navigation stack where other Coordinator Material routes are defined

// In your navigation configuration (e.g., CoordinatorNavigator.js or similar):

// Import the new component
import SubjectActivityPage from '../pages/Coordinator/Material/SubjectActivity/SubjectActivityPage';

// Add the route to your stack navigator
<Stack.Screen 
  name="SubjectActivityPage" 
  component={SubjectActivityPage} 
  options={{ headerShown: false }}
/>

// Make sure this route is placed before or after other material-related routes:
// - MaterialHome
// - SubjectPage
// - LevelPromotion
// etc.
