import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { toast } from 'sonner';

interface Payment {
  id: number;
  order_id: string;
  razorpay_payment_id: string;
  amount: number;
  currency: string;
  status: string;
  user_email: string;
  user_name: string;
  created_at: string;
  course_ids: string;
  course_titles: string;
}

interface Stats {
  totalUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  totalRevenue: number;
  todayRevenue: number;
}

export default function AdminPaymentManager() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [refundLoading, setRefundLoading] = useState<string | null>(null); // Track refund loading per payment

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast.error('You are not authenticated');
        setLoading(false);
        return;
      }
      const backend = (import.meta as any).env?.VITE_BACKEND_URL;
      const response = await fetch(`${backend}/api/admin/payments`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch payments: ${response.status} ${errorText}`);
      }
      const data = await response.json();
      setPayments(data);
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast.error('You are not authenticated');
        return;
      }
      const backend = (import.meta as any).env?.VITE_BACKEND_URL;
      const response = await fetch(`${backend}/api/admin/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch stats: ${response.status} ${errorText}`);
      }
      const data = await response.json();
      const raw = (data && typeof data === 'object' && 'stats' in data) ? (data as any).stats : data;
      const normalized: Stats = {
        totalUsers: Number((raw as any).totalUsers ?? (raw as any).total_users ?? 0),
        totalCourses: Number((raw as any).totalCourses ?? (raw as any).total_courses ?? 0),
        totalEnrollments: Number((raw as any).totalEnrollments ?? (raw as any).total_enrollments ?? 0),
        totalRevenue: Number((raw as any).totalRevenue ?? (raw as any).total_revenue ?? 0),
        todayRevenue: Number((raw as any).todayRevenue ?? (raw as any).today_revenue ?? 0),
      };
      setStats(normalized);
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Error fetching stats');
    }
  };

  const handleRefund = async (payment: Payment) => {
    if (!confirm(`Are you sure you want to refund payment ${payment.order_id}?`)) return;
    
    // Set loading state for this specific payment
    setRefundLoading(payment.razorpay_payment_id);
    
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast.error('You are not authenticated');
        return;
      }
      
      // Get backend URL consistently (remove the fallback URL)
      const backend = (import.meta as any).env?.VITE_BACKEND_URL;
      if (!backend) {
        toast.error('Backend URL not configured');
        return;
      }
      
      // Validate payment has a valid Razorpay ID
      if (!payment.razorpay_payment_id || payment.razorpay_payment_id === 'unknown') {
        toast.error('Cannot refund: Invalid payment ID');
        return;
      }
      
      // Check if payment is already refunded
      if (payment.status === 'refunded') {
        toast.error('Payment has already been refunded');
        return;
      }
      
      // Prepare refund payload based on common Razorpay API expectations
      // IMPORTANT: Check your backend API documentation for exact field names
      const refundPayload = {
        paymentId: payment.razorpay_payment_id,
        reason: 'Refund requested by admin',
        orderId: payment.order_id,
        currency: payment.currency || 'INR',
        notes: {
          admin_initiated: 'true',
          original_order_id: payment.order_id,
          refund_timestamp: new Date().toISOString(),
          user_email: payment.user_email
        }
      };
      
      console.log('Sending refund request:', {
        url: `${backend}/api/admin/payments/refund`,
        payload: refundPayload
      });
      
      const response = await fetch(`${backend}/api/admin/payments/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // Fixed: Changed from 'Content-type' to 'Content-Type'
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(refundPayload),
      });
      
      // Get response text first for debugging
      const responseText = await response.text();
      console.log('Refund response:', {
        status: response.status,
        statusText: response.statusText,
        response: responseText
      });
      
      if (!response.ok) {
        let errorMessage = 'Refund failed';
        
        try {
          // Try to parse error as JSON
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || errorData.message || errorData.detail || errorMessage;
          
          // Handle specific status codes
          if (response.status === 400) {
            errorMessage = `Invalid request: ${errorMessage}`;
          } else if (response.status === 404) {
            errorMessage = 'Payment not found on payment gateway';
          } else if (response.status === 422) {
            // Validation error - show field-specific errors if available
            if (errorData.errors) {
              const fieldErrors = Object.entries(errorData.errors)
                .map(([field, msg]) => `${field}: ${msg}`)
                .join(', ');
              errorMessage = `Validation error: ${fieldErrors}`;
            } else {
              errorMessage = `Validation error: ${errorMessage}`;
            }
          } else if (response.status === 409) {
            errorMessage = 'Refund already processed for this payment';
          } else if (response.status >= 500) {
            errorMessage = 'Server error. Please try again later.';
          }
        } catch (parseError) {
          // Response is not JSON
          errorMessage = `Server returned: ${response.status} ${response.statusText}`;
        }
        
        throw new Error(errorMessage);
      }
      
      // Parse success response
      const data = JSON.parse(responseText);
      toast.success(data.message || 'Refund initiated successfully');
      
      // Refresh payments list
      await fetchPayments();
      
    } catch (error: any) {
      console.error('Refund error details:', {
        message: error.message,
        paymentId: payment.razorpay_payment_id,
        orderId: payment.order_id,
        timestamp: new Date().toISOString()
      });
      
      // Show detailed error message
      const errorMessage = error.message || 'Failed to process refund';
      toast.error(errorMessage);
      
      // If it's a validation error, suggest checking field names
      if (error.message.includes('validation') || error.message.includes('invalid request')) {
        console.warn('Check if field names in refundPayload match backend expectations.');
        console.warn('Common issue: "paymentId" vs "payment_id" field name mismatch.');
      }
      
    } finally {
      // Clear loading state
      setRefundLoading(null);
    }
  };

  useEffect(() => {
    fetchPayments();
    fetchStats();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency || 'INR',
    }).format(amount / 100);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      created: { variant: 'outline', label: 'Created' },
      captured: { variant: 'default', label: 'Captured' },
      failed: { variant: 'destructive', label: 'Failed' },
      refunded: { variant: 'secondary', label: 'Refunded' },
      partially_refunded: { variant: 'secondary', label: 'Partially Refunded' },
      pending: { variant: 'outline', label: 'Pending' },
    };
    const config = statusConfig[status] || { variant: 'outline', label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // Function to test different payload formats (for debugging)
  const testRefundApi = async () => {
    if (!payments.length) return;
    
    const testPayment = payments[0];
    console.log('Testing refund API with payment:', testPayment);
    
    const testPayloads = [
      { payment_id: testPayment.razorpay_payment_id, amount: testPayment.amount, currency: 'INR', reason: 'Test' },
      { paymentId: testPayment.razorpay_payment_id, amount: testPayment.amount, currency: 'INR', reason: 'Test' },
      { razorpay_payment_id: testPayment.razorpay_payment_id, amount: testPayment.amount / 100, currency: 'INR', reason: 'Test' },
    ];
    
    for (const payload of testPayloads) {
      console.log('Testing payload:', payload);
      // You would call your API here with each payload to see which works
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Payment Management</CardTitle>
            <CardDescription>View and manage all payments</CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchPayments}
            disabled={loading}
          >
            Refresh
          </Button>
        </div>
        
        {stats && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <div className="text-sm text-muted-foreground">Total Users</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold">{stats.totalCourses}</div>
              <div className="text-sm text-muted-foreground">Courses</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold">{stats.totalEnrollments}</div>
              <div className="text-sm text-muted-foreground">Enrollments</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue, 'INR')}</div>
              <div className="text-sm text-muted-foreground">Total Revenue</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold">{formatCurrency(stats.todayRevenue, 'INR')}</div>
              <div className="text-sm text-muted-foreground">Today's Revenue</div>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">Loading payments...</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Courses</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">No payments found</TableCell>
                  </TableRow>
                ) : (
                  payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-mono text-sm">
                        <div className="truncate max-w-[100px]" title={payment.order_id}>
                          {payment.order_id}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{payment.user_name}</div>
                        <div className="text-sm text-muted-foreground">{payment.user_email}</div>
                      </TableCell>
                      <TableCell>{formatCurrency(payment.amount, payment.currency)}</TableCell>
                      <TableCell className="max-w-[200px]">
                        {payment.course_titles ? (
                          <div className="truncate" title={payment.course_titles}>
                            {payment.course_titles.split(',').slice(0, 2).join(', ')}
                            {payment.course_titles.split(',').length > 2 && '...'}
                          </div>
                        ) : (
                          'N/A'
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      <TableCell>{formatDate(payment.created_at)}</TableCell>
                      <TableCell>
                        {payment.status === 'captured' ? (
                          payment.razorpay_payment_id && payment.razorpay_payment_id !== 'unknown' ? (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleRefund(payment)}
                              disabled={refundLoading === payment.razorpay_payment_id}
                            >
                              {refundLoading === payment.razorpay_payment_id ? 'Processing...' : 'Refund'}
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground">Not refundable</span>
                          )
                        ) : payment.status === 'refunded' ? (
                          <Badge variant="secondary">Refunded</Badge>
                        ) : null}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
