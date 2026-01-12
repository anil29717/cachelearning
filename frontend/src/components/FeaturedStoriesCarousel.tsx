import React, { useEffect, useState } from 'react';
import { apiClient } from '../utils/api';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from './ui/carousel';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Badge } from './ui/badge';
import { ArrowRight, Quote, Linkedin, Github } from 'lucide-react';

export function FeaturedStoriesCarousel() {
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStory, setSelectedStory] = useState<any>(null);

  useEffect(() => {
    apiClient.getStudentStories({ status: 'featured', limit: 5 })
      .then(data => setStories(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (!loading && stories.length === 0) return null;

  return (
    <section className="py-16 bg-gradient-to-b from-white to-red-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold tracking-tight mb-3">Student Success Stories</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            See how our students transformed their careers and lives through dedication and learning.
          </p>
        </div>

        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full max-w-6xl mx-auto"
        >
          <CarouselContent className="-ml-4">
            {stories.map((story) => (
              <CarouselItem key={story.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                <div className="p-1 h-full">
                  <Card className="h-full border-red-100 hover:shadow-lg transition-shadow duration-300">
                    <CardContent className="p-6 flex flex-col h-full">
                      <div className="flex items-center gap-4 mb-4">
                        <Avatar className="h-14 w-14 border-2 border-red-100">
                          <AvatarImage src={story.profile_image} />
                          <AvatarFallback>{story.student_name?.charAt(0) || 'S'}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-lg leading-tight">{story.student_name}</h3>
                          <p className="text-sm text-gray-500">{story.after_role} at {story.after_company || 'Tech Company'}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-4 text-sm font-medium bg-gray-50 p-2 rounded border border-gray-100">
                        <span className="text-gray-500">{story.background}</span>
                        <ArrowRight className="h-4 w-4 text-red-500" />
                        <span className="text-red-700">{story.after_role}</span>
                      </div>

                      <div className="relative mb-6 flex-grow">
                        <Quote className="absolute -top-2 -left-2 h-8 w-8 text-red-100 -z-10" />
                        <p className="text-gray-600 italic line-clamp-3">
                          "{story.advice}"
                        </p>
                      </div>

                      <div className="mt-auto pt-4 border-t border-gray-100">
                        <div className="flex justify-between items-center">
                          <Badge variant="outline" className="text-xs border-red-200 text-red-700 bg-red-50">
                            {story.during_course_name}
                          </Badge>
                          <Button 
                            variant="ghost" 
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 p-0 h-auto font-medium"
                            onClick={() => setSelectedStory(story)}
                          >
                            Read Story <ArrowRight className="ml-1 h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex" />
          <CarouselNext className="hidden md:flex" />
        </Carousel>

        {/* CTA Section */}
        <div className="text-center mt-12">
          <p className="text-lg font-medium text-gray-700 mb-4">Your story could be next.</p>
          <div className="flex justify-center gap-4">
             <Button className="bg-red-600 hover:bg-red-700 text-white px-8" onClick={() => window.location.href='/#courses'}>
               Start Free Trial
             </Button>
             <Button variant="outline" className="border-red-200 text-red-700 hover:bg-red-50" onClick={() => window.location.href='/#courses'}>
               Apply for Program
             </Button>
          </div>
        </div>
      </div>

      {/* Story Details Modal */}
      <Dialog open={!!selectedStory} onOpenChange={(open) => !open && setSelectedStory(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedStory && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-4 mb-2">
                   <Avatar className="h-16 w-16 border-2 border-red-100">
                      <AvatarImage src={selectedStory.profile_image} />
                      <AvatarFallback>{selectedStory.student_name?.charAt(0) || 'S'}</AvatarFallback>
                   </Avatar>
                   <div>
                      <DialogTitle className="text-2xl">{selectedStory.student_name}</DialogTitle>
                      <DialogDescription className="text-base text-gray-600">
                         {selectedStory.after_role} at {selectedStory.after_company || 'Tech Company'}
                      </DialogDescription>
                   </div>
                </div>
              </DialogHeader>

              <div className="space-y-6 mt-2">
                 {/* Transformation Path */}
                 <div className="bg-red-50 p-4 rounded-lg border border-red-100 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
                    <div>
                       <p className="text-xs font-bold text-red-500 uppercase tracking-wide">Before</p>
                       <p className="font-medium text-gray-900">{selectedStory.background}</p>
                       <p className="text-sm text-gray-500">{selectedStory.before_struggle}</p>
                    </div>
                    <ArrowRight className="hidden md:block text-red-300 h-6 w-6 flex-shrink-0" />
                    <div>
                       <p className="text-xs font-bold text-red-500 uppercase tracking-wide">After</p>
                       <p className="font-medium text-gray-900">{selectedStory.after_role}</p>
                       {selectedStory.after_salary_hike && (
                          <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100 mt-1">
                             {selectedStory.after_salary_hike}
                          </Badge>
                       )}
                    </div>
                 </div>

                 {/* Journey Details */}
                 <div className="grid md:grid-cols-2 gap-6">
                    <div>
                       <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-red-500"></div> During the Course
                       </h4>
                       <ul className="space-y-2 text-sm text-gray-600">
                          <li><span className="font-medium text-gray-900">Program:</span> {selectedStory.during_course_name}</li>
                          <li><span className="font-medium text-gray-900">Duration:</span> {selectedStory.during_duration} months</li>
                          <li><span className="font-medium text-gray-900">Projects:</span> {Array.isArray(selectedStory.during_projects) ? selectedStory.during_projects.join(', ') : selectedStory.during_projects}</li>
                          <li><span className="font-medium text-gray-900">Mentor Rating:</span> {selectedStory.during_mentor_rating}/5 ⭐</li>
                       </ul>
                    </div>
                    <div>
                       <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div> The Outcome
                       </h4>
                       <ul className="space-y-2 text-sm text-gray-600">
                          <li><span className="font-medium text-gray-900">Confidence:</span> {selectedStory.after_confidence}/5 🚀</li>
                          <li><span className="font-medium text-gray-900">Advice:</span> "{selectedStory.advice}"</li>
                       </ul>
                    </div>
                 </div>

                 {/* Social Links */}
                 <div className="flex gap-4 pt-4 border-t border-gray-100">
                    {selectedStory.linkedin_url && (
                       <a href={selectedStory.linkedin_url} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm" className="gap-2">
                             <Linkedin className="h-4 w-4 text-blue-600" /> LinkedIn
                          </Button>
                       </a>
                    )}
                    {selectedStory.github_url && (
                       <a href={selectedStory.github_url} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm" className="gap-2">
                             <Github className="h-4 w-4" /> GitHub
                          </Button>
                       </a>
                    )}
                 </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
