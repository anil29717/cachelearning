import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { apiClient } from '../utils/api';
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const canSubmit = name.trim().length >= 2 && email.includes('@') && message.trim().length >= 3;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!canSubmit) {
        toast.error('Please fill name, valid email, and a short message');
        return;
      }
      setSending(true);
      await apiClient.sendContactMessage({ name, email, subject, message });
      toast.success('Message sent');
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to send');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100">
      <div className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="inline-flex items-center justify-center rounded-2xl px-4 py-2 bg-gradient-to-r from-red-600 via-red-500 to-red-400 text-white shadow-md">
              <MessageSquare className="h-5 w-5 mr-2" />
              <span className="font-semibold">We’d love to hear from you</span>
            </div>
            <h1 className="mt-6 text-3xl md:text-4xl font-bold bg-gradient-to-r from-red-700 via-red-600 to-red-500 bg-clip-text text-transparent">Contact Us</h1>
            <p className="mt-3 text-gray-600">Ask anything about courses, billing or partnerships</p>
          </div>
          <div className="mt-10 grid lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2 shadow-xl border-red-100">
              <CardHeader>
                <CardTitle className="text-xl">Send a message</CardTitle>
                <CardDescription>We typically respond within 24 hours</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={submit} className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-4">
                    <Input placeholder="Your Name" value={name} onChange={(e) => setName(e.target.value)} className="h-11 bg-red-50 border-red-200 focus-visible:ring-red-500" required />
                    <Input type="email" placeholder="Your Email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-11 bg-red-50 border-red-200 focus-visible:ring-red-500" required />
                  </div>
                  <Input placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} className="h-11 bg-red-50 border-red-200 focus-visible:ring-red-500" />
                  <Textarea placeholder="Message" value={message} onChange={(e) => setMessage(e.target.value)} className="min-h-[160px] bg-red-50 border-red-200 focus-visible:ring-red-500" required />
                  <Button type="submit" disabled={sending} className="w-full h-11 bg-gradient-to-r from-red-700 via-red-600 to-red-500 hover:from-red-600 hover:via-red-500 hover:to-red-400 text-white">
                    {sending ? 'Sending…' : (<span className="inline-flex items-center"><Send className="h-4 w-4 mr-2" /> Send Message</span>)}
                  </Button>
                </form>
              </CardContent>
            </Card>
            <div>
              <Card className="shadow-xl border-red-100">
                <CardHeader>
                  <CardTitle className="text-xl">Contact details</CardTitle>
                  <CardDescription>Reach us directly</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-white border border-red-100">
                    <Mail className="h-5 w-5 text-red-600" />
                    <div>
                      <div className="text-sm font-medium">Email</div>
                      <div className="text-sm text-gray-600">support@cachelearning.com</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-white border border-red-100">
                    <Phone className="h-5 w-5 text-red-600" />
                    <div>
                      <div className="text-sm font-medium">Phone</div>
                      <div className="text-sm text-gray-600">+91 98765 43210</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-white border border-red-100">
                    <MapPin className="h-5 w-5 text-red-600" />
                    <div>
                      <div className="text-sm font-medium">Address</div>
                      <div className="text-sm text-gray-600">Cache Learning, India</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <div className="mt-6 rounded-2xl p-4 bg-gradient-to-r from-red-600 via-red-500 to-red-400 text-white text-sm shadow-md">
                We’re committed to responding quickly. Include as much detail as possible for faster assistance.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
