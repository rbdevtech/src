export const metadata = {
    title: 'Admin Login',
    description: 'Login to your admin dashboard',
  };
  
  export default function LoginLayout({ children }) {
    return (
      <div className="bg-gray-50">
        {children}
      </div>
    );
  }