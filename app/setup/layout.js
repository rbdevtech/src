export const metadata = {
    title: 'Admin Setup',
    description: 'Set up your first admin user',
  };
  
  export default function SetupLayout({ children }) {
    return (
      <div className="bg-gray-50">
        {children}
      </div>
    );
  }