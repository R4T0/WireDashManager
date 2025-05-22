
export type User = {
  id: string;
  email: string;
  isAdmin: boolean;
  created_at: string;
};

// Helper function to map database fields to our User type
export const mapDatabaseUserToUser = (dbUser: any): User => {
  return {
    id: dbUser.id,
    email: dbUser.email,
    isAdmin: dbUser.isadmin || false, // Map from database field 'isadmin' to our type's 'isAdmin'
    created_at: dbUser.created_at
  };
};
