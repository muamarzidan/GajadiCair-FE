import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import type { CredentialResponse } from '@react-oauth/google';
import { GoogleLogin } from '@react-oauth/google';
import { Eye, EyeOff, AlertCircle, Home, Building2, Users } from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';


type LoginMode = 'company' | 'employee';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading: authLoading, user, loginAsCompany, loginAsEmployee, loginWithGoogle } = useAuth();
  const [loginMode, setLoginMode] = useState<LoginMode>('company');
  const [showPassword, setShowPassword] = useState(false);
  const [companyEmail, setCompanyEmail] = useState('');
  const [companyPassword, setCompanyPassword] = useState('');
  const [employeeCompanyId, setEmployeeCompanyId] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [employeePassword, setEmployeePassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';
  
  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      // Check if employee needs face registration
      if (user.role === 'employee' && user.face_id === null) {
        navigate('/face-registration', { 
          replace: true,
          state: { fromLogin: true }
        });
      } else {
        navigate(from, { replace: true });
      }
    }
  }, [authLoading, isAuthenticated, user, navigate, from]);
  
  const handleCompanyLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await loginAsCompany({ email: companyEmail, password: companyPassword });
      navigate(from, { replace: true });
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    };
  };
  const handleEmployeeLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      await loginAsEmployee({ 
        company_id: employeeCompanyId, 
        employee_id: employeeId, 
        password: employeePassword 
      });
      
      // Navigation handled by useEffect based on face_id
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };
  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      setError('Login with google failed');
      return;
    }; 

    setError('');
    setIsLoading(true);
    try {
      await loginWithGoogle({ id_token: credentialResponse.credential });
      navigate(from, { replace: true });
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    };
  };
  const handleGoogleError = () => {
    setError('Login with google failed');
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gradient mb-2">GajadiCair</h1>
        <p className="text-muted-foreground">Login to your account</p>
      </div>
      <Card className="p-6">
        <div className="flex gap-2 mb-6">
          <button type="button" onClick={() => { setLoginMode('company'); setError(''); }} className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all ${loginMode === 'company' ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}>
            <Building2 className="h-4 w-4" />
            Company
          </button>
          <button type="button" onClick={() => { setLoginMode('employee'); setError(''); }} className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all ${loginMode === 'employee' ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}>
            <Users className="h-4 w-4" />
            Employee
          </button>
        </div>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-red-700">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}
        {loginMode === 'company' && (
          <form onSubmit={handleCompanyLogin} className="space-y-4">
            <div>
              <label htmlFor="company-email" className="block text-sm font-medium mb-2">Email</label>
              <input id="company-email" type="email" value={companyEmail} onChange={(e) => setCompanyEmail(e.target.value)} className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" placeholder="company@example.com" disabled={isLoading} required />
            </div>
            <div>
              <label htmlFor="company-password" className="block text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <input id="company-password" type={showPassword ? 'text' : 'password'} value={companyPassword} onChange={(e) => setCompanyPassword(e.target.value)} className="w-full px-3 py-2 pr-10 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" placeholder="********" disabled={isLoading} required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4 cursor-pointer" /> : <Eye className="h-4 w-4 cursor-pointer" />}
                </button>
              </div>
            </div>
            <Button variant="default" size="default" type="submit" className="w-full" disabled={isLoading}>{isLoading ? 'Signing in...' : 'Sign In as Company'}</Button>
          </form>
        )}
        {loginMode === 'employee' && (
          <form onSubmit={handleEmployeeLogin} className="space-y-4">
            <div>
              <label htmlFor="employee-company-id" className="block text-sm font-medium mb-2">Company ID</label>
              <input id="employee-company-id" type="text" value={employeeCompanyId} onChange={(e) => setEmployeeCompanyId(e.target.value)} className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" placeholder="company-uuid" disabled={isLoading} required />
            </div>
            <div>
              <label htmlFor="employee-id" className="block text-sm font-medium mb-2">Employee ID</label>
              <input id="employee-id" type="text" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" placeholder="employee-uuid" disabled={isLoading} required />
            </div>
            <div>
              <label htmlFor="employee-password" className="block text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <input id="employee-password" type={showPassword ? 'text' : 'password'} value={employeePassword} onChange={(e) => setEmployeePassword(e.target.value)} className="w-full px-3 py-2 pr-10 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" placeholder="********" disabled={isLoading} required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4 cursor-pointer" /> : <Eye className="h-4 w-4 cursor-pointer" />}
                </button>
              </div>
            </div>
            <Button variant="default" size="default" type="submit" className="w-full" disabled={isLoading}>{isLoading ? 'Signing in...' : 'Sign In as Employee'}</Button>
          </form>
        )}
        {loginMode === 'company' && (
          <>
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-background px-2 text-muted-foreground">Or</span>
              </div>
            </div>
            <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError} text="signin_with" shape="rectangular" size="large" width="100%" />
          </>
        )}
        <div className="mt-4 text-center space-y-2">
          {loginMode === 'company' && (
            <div>
              <span className="text-sm text-muted-foreground">Don't have an account yet? </span>
              <Link to="/register" className="text-sm text-primary font-semibold hover:underline">Sign up now</Link>
            </div>
          )}
          <Link to="/" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
            <Home className="inline h-4 w-4" /> Back to home
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;