import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/context/UserContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Mail, Bell, Users, Send, Loader2 } from 'lucide-react';

const Admin = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [stats, setStats] = useState({ users: 0, pushSubscribers: 0 });
  const [emailSubject, setEmailSubject] = useState('');
  const [emailContent, setEmailContent] = useState('');
  const [pushTitle, setPushTitle] = useState('');
  const [pushBody, setPushBody] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isSendingPush, setIsSendingPush] = useState(false);

  // Simple admin check - you can customize this
  const ADMIN_EMAILS = ['muzaamba8811@gmail.com']; // Add your admin email here

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    // Check if user is admin
    const userEmail = user.email;
    if (!ADMIN_EMAILS.includes(userEmail)) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page",
        variant: "destructive"
      });
      navigate('/');
      return;
    }

    fetchStats();
  }, [user, navigate]);

  const fetchStats = async () => {
    try {
      const [profilesRes, pushRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('push_subscriptions').select('id', { count: 'exact', head: true })
      ]);
      
      setStats({
        users: profilesRes.count || 0,
        pushSubscribers: pushRes.count || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const sendEmail = async () => {
    if (!emailSubject.trim() || !emailContent.trim()) {
      toast({
        title: "Khalad",
        description: "Fadlan buuxi subject iyo content",
        variant: "destructive"
      });
      return;
    }

    setIsSendingEmail(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          subject: emailSubject,
          htmlContent: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #10b981;">SomDiet</h1>
            ${emailContent.split('\n').map(p => `<p>${p}</p>`).join('')}
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;" />
            <p style="color: #666; font-size: 12px;">SomDiet - Caafimaadkaaga waa Hantidaada</p>
          </div>`,
          toAll: true
        }
      });

      if (error) throw error;

      toast({
        title: "Email-ka la diray!",
        description: `${data.results?.success || 0} qof ayaa helay email-ka`
      });
      
      setEmailSubject('');
      setEmailContent('');
    } catch (error: any) {
      console.error('Error sending email:', error);
      toast({
        title: "Khalad ayaa dhacay",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  const sendPushNotification = async () => {
    if (!pushTitle.trim() || !pushBody.trim()) {
      toast({
        title: "Khalad",
        description: "Fadlan buuxi title iyo body",
        variant: "destructive"
      });
      return;
    }

    setIsSendingPush(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-push-notification', {
        body: {
          title: pushTitle,
          body: pushBody,
          url: '/dashboard'
        }
      });

      if (error) throw error;

      toast({
        title: "Ogeysiiska la diray!",
        description: `${data.results?.success || 0} qof ayaa helay ogeysiiska`
      });
      
      setPushTitle('');
      setPushBody('');
    } catch (error: any) {
      console.error('Error sending push:', error);
      toast({
        title: "Khalad ayaa dhacay",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSendingPush(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">Maaree isticmaalayaasha iyo ogeysiisyada</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" />
                Isticmaalayaal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.users}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Push Subscribers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.pushSubscribers}</p>
            </CardContent>
          </Card>
        </div>

        {/* Send Messages */}
        <Tabs defaultValue="email" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email
            </TabsTrigger>
            <TabsTrigger value="push" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Push Notification
            </TabsTrigger>
          </TabsList>

          <TabsContent value="email">
            <Card>
              <CardHeader>
                <CardTitle>Dir Email Dhammaan Isticmaalayaasha</CardTitle>
                <CardDescription>
                  Email-ka wuxuu u tagi doonaa {stats.users} qof
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Subject</label>
                  <Input
                    placeholder="Talooyinka Caafimaadka - SomDiet"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Content</label>
                  <Textarea
                    placeholder="Qor fariintaada halkan..."
                    value={emailContent}
                    onChange={(e) => setEmailContent(e.target.value)}
                    rows={6}
                  />
                </div>
                <Button 
                  onClick={sendEmail} 
                  disabled={isSendingEmail}
                  className="w-full"
                >
                  {isSendingEmail ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Diraya...</>
                  ) : (
                    <><Send className="mr-2 h-4 w-4" /> Dir Email</>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="push">
            <Card>
              <CardHeader>
                <CardTitle>Dir Push Notification</CardTitle>
                <CardDescription>
                  Ogeysiiska wuxuu u tagi doonaa {stats.pushSubscribers} qof oo subscribe-garay
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    placeholder="SomDiet"
                    value={pushTitle}
                    onChange={(e) => setPushTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Body</label>
                  <Textarea
                    placeholder="Xusuusin: Ku qor cuntooyinkaaga maanta!"
                    value={pushBody}
                    onChange={(e) => setPushBody(e.target.value)}
                    rows={3}
                  />
                </div>
                <Button 
                  onClick={sendPushNotification} 
                  disabled={isSendingPush}
                  className="w-full"
                >
                  {isSendingPush ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Diraya...</>
                  ) : (
                    <><Send className="mr-2 h-4 w-4" /> Dir Ogeysiis</>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
