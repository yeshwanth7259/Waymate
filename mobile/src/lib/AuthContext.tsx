import React, { createContext, useState, useContext, useEffect } from 'react';
// @ts-ignore
import auth from '@react-native-firebase/auth';

type UserData = {
  id?: string;
  fullName: string;
  phone: string;
  email: string;
  dateOfBirth: string;
  gender: string;
};

type AuthContextType = {
  user: UserData | null;
  setUser: (user: UserData | null) => void;
  updateUserInDB: (data: Partial<UserData>) => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  updateUserInDB: async () => {},
});

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<UserData | null>(null);

  // Example: Sync user to DB when user object changes
  useEffect(() => {
     if (user && user.phone) {
        syncUserToDB(user);
     }
  }, [user]);

  const syncUserToDB = async (userData: UserData) => {
     try {
       const currentUser = auth().currentUser;
       if (!currentUser) return;
       const token = await currentUser.getIdToken();
       
       const response = await fetch('http://10.0.2.2:3001/api/users/me', {
          method: 'PUT',
          headers: {
             'Content-Type': 'application/json',
             'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
             firstName: userData.fullName.split(' ')[0],
             lastName: userData.fullName.split(' ').slice(1).join(' '),
             email: userData.email,
             gender: userData.gender,
             // dob if backend supports it
          })
       });
       if (!response.ok) {
           console.error('Failed to sync user with backend:', await response.text());
       }
     } catch (error) {
       console.error("DB Sync error:", error);
     }
  };

  const updateUserInDB = async (data: Partial<UserData>) => {
     if (!user) return;
     try {
        const currentUser = auth().currentUser;
        if (!currentUser) return;
        const token = await currentUser.getIdToken();
        
        await fetch('http://10.0.2.2:3001/api/users/me', {
           method: 'PUT',
           headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
           },
           body: JSON.stringify({
              firstName: data.fullName?.split(' ')[0],
              lastName: data.fullName?.split(' ').slice(1).join(' '),
              email: data.email,
              gender: data.gender,
           })
        });
        setUser({ ...user, ...data } as UserData);
     } catch(e) {
        console.error(e);
     }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, updateUserInDB }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
