
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/context/UserContext';
import { Navigate, Link, useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Loader2 } from 'lucide-react';

const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

const signUpSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters")
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

type SignInFormValues = z.infer<typeof signInSchema>;
type SignUpFormValues = z.infer<typeof signUpSchema>;

const Auth = () => {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'signup' ? 'signup' : 'signin';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { toast } = useToast();
  const { user, signIn, signUp } = useUser();
  
  const signInForm = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });
  
  const signUpForm = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: ''
    }
  });
  
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);
  
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  const handleSignIn = async (values: SignInFormValues) => {
    setLoading(true);
    try {
      await signIn(values.email, values.password);
    } catch (error) {
      console.error('Sign in error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSignUp = async (values: SignUpFormValues) => {
    setLoading(true);
    try {
      await signUp(values.email, values.password);
      signUpForm.reset();
      setActiveTab('signin');
      toast({
        title: 'Account created',
        description: 'You can now sign in with your new account.',
      });
    } catch (error) {
      console.error('Sign up error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(35_90%_55%/0.05)_0%,transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,hsl(150_45%_45%/0.03)_0%,transparent_50%)]" />
      
      <div className="relative w-full max-w-md">
        {/* Back link */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to home</span>
        </Link>
        
        <Card className="bg-card border-border shadow-[var(--shadow-card)]">
          <CardHeader className="text-center pb-2">
            <CardTitle className="font-display text-3xl text-foreground">Welcome</CardTitle>
            <CardDescription className="text-muted-foreground">
              Sign in or create an account to track your nutrition
            </CardDescription>
          </CardHeader>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="px-6">
              <TabsList className="grid grid-cols-2 w-full bg-secondary/50 p-1 rounded-full">
                <TabsTrigger 
                  value="signin" 
                  className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
                >
                  Sign In
                </TabsTrigger>
                <TabsTrigger 
                  value="signup" 
                  className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
                >
                  Sign Up
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="signin">
              <Form {...signInForm}>
                <form onSubmit={signInForm.handleSubmit(handleSignIn)}>
                  <CardContent className="space-y-4 pt-6">
                    <FormField
                      control={signInForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-muted-foreground">Email</FormLabel>
                          <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <FormControl>
                              <Input 
                                placeholder="you@example.com" 
                                autoComplete="email"
                                {...field}
                                className="h-12 bg-secondary border-border rounded-xl pl-11 placeholder:text-muted-foreground focus:border-primary"
                              />
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={signInForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-muted-foreground">Password</FormLabel>
                          <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <FormControl>
                              <Input 
                                type={showPassword ? "text" : "password"}
                                autoComplete="current-password"
                                {...field}
                                className="h-12 bg-secondary border-border rounded-xl pl-11 pr-12 placeholder:text-muted-foreground focus:border-primary"
                              />
                            </FormControl>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 p-0 text-muted-foreground hover:text-foreground"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                  <CardFooter className="pt-2">
                    <Button 
                      type="submit" 
                      className="w-full h-12 rounded-full bg-primary text-primary-foreground hover:bg-primary/90" 
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Signing in...
                        </>
                      ) : (
                        'Sign In'
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            </TabsContent>
            
            <TabsContent value="signup">
              <Form {...signUpForm}>
                <form onSubmit={signUpForm.handleSubmit(handleSignUp)}>
                  <CardContent className="space-y-4 pt-6">
                    <FormField
                      control={signUpForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-muted-foreground">Email</FormLabel>
                          <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <FormControl>
                              <Input 
                                placeholder="you@example.com" 
                                autoComplete="email"
                                {...field}
                                className="h-12 bg-secondary border-border rounded-xl pl-11 placeholder:text-muted-foreground focus:border-primary"
                              />
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={signUpForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-muted-foreground">Password</FormLabel>
                          <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <FormControl>
                              <Input 
                                type={showPassword ? "text" : "password"}
                                autoComplete="new-password"
                                {...field}
                                className="h-12 bg-secondary border-border rounded-xl pl-11 pr-12 placeholder:text-muted-foreground focus:border-primary"
                              />
                            </FormControl>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 p-0 text-muted-foreground hover:text-foreground"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                          <FormMessage />
                          <FormDescription className="text-xs text-muted-foreground">
                            Minimum 6 characters
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={signUpForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-muted-foreground">Confirm Password</FormLabel>
                          <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <FormControl>
                              <Input 
                                type={showConfirmPassword ? "text" : "password"}
                                autoComplete="new-password"
                                {...field}
                                className="h-12 bg-secondary border-border rounded-xl pl-11 pr-12 placeholder:text-muted-foreground focus:border-primary"
                              />
                            </FormControl>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 p-0 text-muted-foreground hover:text-foreground"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                  <CardFooter className="pt-2">
                    <Button 
                      type="submit" 
                      className="w-full h-12 rounded-full bg-primary text-primary-foreground hover:bg-primary/90" 
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Creating account...
                        </>
                      ) : (
                        'Create Account'
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
