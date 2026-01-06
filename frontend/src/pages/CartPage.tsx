import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
// import { apiClient } from '../utils/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { Trash2, ShoppingCart, Lock } from 'lucide-react';
import { toast } from 'sonner';
// Card-only checkout: remove payment method selector
import RazorpayButton from '../components/RazorpayButton';
import CardPaymentForm from '../components/CardPaymentForm';
import MultiPaymentForm from '../components/MultiPaymentForm';
import { SetupRequiredBanner } from '../components/SetupRequiredBanner';

// Payment gateway removed: no Razorpay declarations needed

function CheckoutForm({ total, courseIds, onSuccess }: { total: number; courseIds: string[]; onSuccess: () => void }) {
  const [processing, setProcessing] = useState(false);
  const { user } = useAuth();
  const keyId = (import.meta as any).env?.VITE_RAZORPAY_KEY_ID || (import.meta as any).env?.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const hasRazorpay = !!keyId;
  const isStudent = user?.role === 'student';
  
  // Payments are required; remove free enrollment fallback

  return (
    <div>
      <div className="space-y-6 mb-6">
        {/* Card-only payment: selector removed */}

        {/* Razorpay Checkout Button (enabled when key is set) */}
        {hasRazorpay && isStudent ? (
          <MultiPaymentForm
            total={total}
            courseIds={courseIds}
            onSuccess={() => {
              toast.success('Payment successful!');
              onSuccess();
            }}
          />
        ) : !hasRazorpay ? (
          /* Payments required: show setup notice */
          <div className="space-y-4">
            <SetupRequiredBanner />
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-2">
                <Lock className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="mb-2">Payments are required to access courses.</p>
                  <p className="text-xs text-blue-600">Add your Razorpay test keys to enable checkout and remove free access.</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <div className="text-sm text-amber-900">
                Only students can purchase courses. Switch to a student account.
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
        {/* Removed free enrollment button. Payment is required. */}
      </div>
      {/* Test Mode helper */}
      {hasRazorpay && isStudent && (
        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded">
          <p className="text-amber-900 text-sm">
            <strong>Test Mode:</strong> Use card <code>4111 1111 1111 1111</code>, any future expiry, any CVV.
          </p>
        </div>
      )}
    </div>
  );
}

export function CartPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart: items, removeFromCart, clearCart, totalAmount: total } = useCart();
  const [checkingOut, setCheckingOut] = useState(false);
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, []);

  // Hide cart for non-student roles
  useEffect(() => {
    if (user && user.role !== 'student') {
      toast.warning('Cart is available for students only');
      navigate('/');
    }
  }, [user, navigate]);

  const handleRemove = (courseId: number) => {
    removeFromCart(courseId);
    toast.success('Item removed from cart');
  };

  const handleCheckout = () => {
    if (!user) {
      toast.error('Please sign in to checkout');
      navigate('/login');
      return;
    }
    if (user.role !== 'student') {
      toast.error('Only students can purchase courses');
      return;
    }
    setCheckingOut(true);
  };

  const handlePaymentSuccess = () => {
    clearCart();
    toast.success('Enrollment successful!');
    navigate('/profile');
  };

  if (items.length === 0 && !checkingOut) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center relative overflow-hidden">
        <div className="absolute top-20 left-20 w-64 h-64 bg-red-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-red-100/30 rounded-full blur-3xl"></div>
        <div className="text-center relative z-10">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-red-600 rounded-full blur opacity-20"></div>
            <div className="relative inline-flex items-center justify-center w-24 h-24 bg-red-50 rounded-full border border-red-200">
              <ShoppingCart className="h-12 w-12 text-red-600" />
            </div>
          </div>
          <h2 className="mb-2 text-gray-900">Your cart is empty</h2>
          <p className="text-gray-600 mb-8">Explore our courses and add some to your cart</p>
          <div className="relative inline-block group">
            <Button 
              onClick={() => navigate('/')}
              className="relative bg-red-600 hover:bg-red-700 text-white shadow-lg transform hover:scale-105 transition-all duration-300"
              size="lg"
            >
              Browse Courses
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const courseIds = items.map(item => String(item.course.id));

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12">
        <h1 className="mb-4 text-gray-900">Course Enrollment</h1>
        <p className="text-gray-600 mb-10">Review your selected courses and complete enrollment</p>

        <div className="grid lg:grid-cols-3 gap-8">
          {!checkingOut ? (
            <>
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-6">
                {items.map(({ course }) => (
                  <Card key={course.id} className="shadow-sm border border-red-100">
                    <CardContent className="p-6">
                      <div className="flex gap-6">
                        {course.thumbnail_url ? (
                          <img
                            src={course.thumbnail_url}
                            alt={course.title}
                            className="w-48 h-32 object-cover rounded-md"
                          />
                        ) : (
                          <div className="w-48 h-32 bg-red-50 border border-red-100 rounded-md flex items-center justify-center">
                            <ShoppingCart className="h-10 w-10 text-red-500" />
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="mb-1 text-gray-900">{course.title}</h3>
                          <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                            {course.description}
                          </p>
                          <span className="inline-block bg-red-50 text-red-700 text-xs px-3 py-1 rounded-full border border-red-100">
                            {course.category}
                          </span>
                        </div>
                        <div className="text-right flex flex-col justify-between">
                          <p className="text-2xl text-red-600">₹{course.price}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemove(course.id)}
                            className="hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Order Summary */}
              <div>
                <Card className="sticky top-4 shadow-sm border border-red-100">
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal</span>
                        <span>₹{total.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tax</span>
                        <span>₹0.00</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-xl">
                        <span>Total</span>
                        <span>₹{total.toFixed(2)}</span>
                      </div>
                      <Button
                        onClick={handleCheckout}
                        className="w-full bg-red-600 hover:bg-red-700 text-white"
                        size="lg"
                      >
                        Proceed to Checkout
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <>
              {/* Checkout Form */}
              <div className="lg:col-span-2">
                <Card className="border border-red-100">
                  <CardHeader>
                    <CardTitle>Payment Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CheckoutForm
                      total={total}
                      courseIds={courseIds}
                      onSuccess={handlePaymentSuccess}
                    />
                    <div className="mt-4">
                      <Button
                        variant="ghost"
                        onClick={() => setCheckingOut(false)}
                        className="text-red-700 hover:bg-red-50"
                      >
                        Back to Cart
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Order Summary (Checkout) */}
              <div>
                <Card className="sticky top-4 border border-red-100">
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 mb-4">
                      {items.map(({ course }) => (
                        <div key={course.id} className="flex justify-between text-sm">
                          <span className="truncate mr-2">{course.title}</span>
                          <span className="flex-shrink-0">₹{course.price}</span>
                        </div>
                      ))}
                    </div>
                    <Separator className="my-4" />
                    <div className="flex justify-between text-xl">
                      <span>Total</span>
                      <span>₹{total.toFixed(2)}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
