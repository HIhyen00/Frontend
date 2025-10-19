import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaHeart,
    FaComment,
    FaShare,
    FaPlus,
    FaUser
} from 'react-icons/fa';
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from 'react-icons/md';
import { postApi } from '../api/snsApi';
import type { Post } from '../types/post.types';
import CreatePostModal from '../components/CreatePostModal';
import { useAuth } from '../../shared/hooks/useAuth';

function PetSns() {
    const { isAuthenticated } = useAuth();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // 시간 포맷 헬퍼 함수
    const formatTimeAgo = (dateString: string): string => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMs = now.getTime() - date.getTime();
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

        if (diffInMinutes < 60) {
            return `${diffInMinutes}분 전`;
        } else if (diffInHours < 24) {
            return `${diffInHours}시간 전`;
        } else {
            return `${diffInDays}일 전`;
        }
    };

    // ESC 키로 전체 화면 닫기
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isFullscreen) {
                setIsFullscreen(false);
            }
        };
        
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isFullscreen]);

    // 실제 API에서 데이터 가져오기
    const fetchPosts = async () => {
        try {
            setLoading(true);
            // 랜덤 게시물 또는 모든 게시물 가져오기
            const data = await postApi.getRandomPosts();
            console.log('=== 게시물 조회 완료 ===');
            console.log('전체 데이터:', data);
            console.log('모든 게시물의 isLiked 상태:', data.map(p => ({
                id: p.id,
                isLiked: p.isLiked,
                isLiked타입: typeof p.isLiked,
                likeCount: p.likeCount
            })));
            console.log('로그인 상태:', isAuthenticated);
            setPosts(data);
        } catch (error) {
            console.error('게시물을 불러오는데 실패했습니다:', error);
            // 에러 시 빈 배열로 설정
            setPosts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    // 좋아요 토글 함수
    const handleLikeToggle = async (postId: number, isLiked: boolean) => {
        if (!isAuthenticated) {
            alert('로그인이 필요합니다.');
            return;
        }

        try {
            console.log('좋아요 토글:', { postId, isLiked, action: isLiked ? 'unlike' : 'like' });
            
            // 낙관적 업데이트 (즉시 UI 반영)
            setPosts(prevPosts => prevPosts.map(post => {
                if (post.id === postId) {
                    console.log('게시물 업데이트:', {
                        id: post.id,
                        이전_isLiked: post.isLiked,
                        이전_likeCount: post.likeCount,
                        새로운_isLiked: !isLiked,
                        새로운_likeCount: isLiked ? post.likeCount - 1 : post.likeCount + 1
                    });
                    return {
                        ...post,
                        isLiked: !isLiked,
                        likeCount: isLiked ? post.likeCount - 1 : post.likeCount + 1
                    };
                }
                return post;
            }));
            
            // 백엔드 API 호출 (동기화)
            if (isLiked) {
                await postApi.unlikePost(postId);
                console.log('좋아요 취소 API 완료');
            } else {
                await postApi.likePost(postId);
                console.log('좋아요 추가 API 완료');
            }
            
            // fetchPosts()를 호출하지 않음 - 랜덤 게시물이 바뀌는 것을 방지
            console.log('UI 업데이트 완료 (서버 동기화 완료)');
        } catch (error: any) {
            console.error('좋아요 처리 실패:', error);
            console.error('에러 상세:', error.response?.data);
            
            // 에러 발생 시 원래 상태로 되돌림
            setPosts(prevPosts => prevPosts.map(post => {
                if (post.id === postId) {
                    return {
                        ...post,
                        isLiked: isLiked,
                        likeCount: isLiked ? post.likeCount + 1 : post.likeCount - 1
                    };
                }
                return post;
            }));
            alert('좋아요 처리에 실패했습니다.');
        }
    };

    const paginate = (newDirection: number) => {
        setDirection(newDirection);
        if (newDirection === 1) {
            setCurrentIndex(prevIndex => 
                prevIndex === posts.length - 1 ? 0 : prevIndex + 1
            );
        } else {
            setCurrentIndex(prevIndex => 
                prevIndex === 0 ? posts.length - 1 : prevIndex - 1
            );
        }
    };

    const variants = {
        enter: (direction: number) => {
            return {
                x: direction > 0 ? 1000 : -1000,
                opacity: 0
            };
        },
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1
        },
        exit: (direction: number) => {
            return {
                zIndex: 0,
                x: direction < 0 ? 1000 : -1000,
                opacity: 0
            };
        }
    };

    const swipeConfidenceThreshold = 10000;
    const swipePower = (offset: number, velocity: number) => {
        return Math.abs(offset) * velocity;
    };

    const formatNumber = (num: number): string => {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        } else {
            return num.toString();
        }
    };

    if (loading) {
        return (
            <div className="pt-24 h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (posts.length === 0) {
        return (
            <div className="pt-28 pb-28 min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto px-4">
                    <div className="bg-white rounded-3xl shadow-xl p-12">
                        <p className="text-6xl mb-6">📭</p>
                        <h2 className="text-3xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-600">
                            게시물이 없습니다
                        </h2>
                        <p className="text-gray-600 text-lg mb-8">첫 번째 게시물을 작성해보세요!</p>
                        {isAuthenticated && (
                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="bg-blue-600 text-white px-6 py-3.5 rounded-2xl font-semibold hover:bg-blue-700 shadow-lg transition-all active:scale-95"
                            >
                                게시물 작성하기
                            </button>
                        )}
                    </div>
                </div>
                <CreatePostModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onPostCreated={fetchPosts}
                />
            </div>
        );
    }

    return (
        <>
        <div className="pt-20 pb-20 min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
            {/* 우측 하단 버튼 그룹 */}
            <div className="fixed bottom-8 right-8 z-40 flex flex-col space-y-3">
                {/* 나의 게시물 버튼 */}
                {isAuthenticated && (
                    <button
                        onClick={() => window.location.href = '/sns/my-posts'}
                        className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full p-4 shadow-lg hover:shadow-blue-500/50 transition-all hover:scale-110 backdrop-blur-sm"
                        title="나의 게시물"
                    >
                        <FaUser size={24} />
                    </button>
                )}
                
                {/* 게시물 작성 버튼 */}
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-full p-4 shadow-lg hover:shadow-blue-500/50 transition-all hover:scale-110 backdrop-blur-sm"
                    title={isAuthenticated ? "게시물 작성" : "로그인이 필요합니다"}
                >
                    <FaPlus size={24} />
                </button>
            </div>

            {/* Hero Section */}
            <div className="container mx-auto px-4 mb-12">
                <div className="text-center mb-8">


                </div>
            </div>

            {/* Main Feed */}
            <div className="max-w-4xl mx-auto px-4 relative mb-16">
                <div className="relative w-full h-[600px] overflow-hidden rounded-3xl shadow-2xl bg-white">
                    <AnimatePresence initial={false} custom={direction}>
                        <motion.div
                            key={currentIndex}
                            custom={direction}
                            variants={variants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{
                                x: { type: "spring", stiffness: 300, damping: 30 },
                                opacity: { duration: 0.2 }
                            }}
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            dragElastic={1}
                            onDragEnd={(_, { offset, velocity }) => {
                                const swipe = swipePower(offset.x, velocity.x);
                                if (swipe < -swipeConfidenceThreshold) {
                                    paginate(1);
                                } else if (swipe > swipeConfidenceThreshold) {
                                    paginate(-1);
                                }
                            }}
                            className="absolute w-full h-full"
                        >
                            {posts[currentIndex] && (
                                <div 
                                    className="w-full h-full relative overflow-hidden group cursor-pointer"
                                    onDoubleClick={() => setIsFullscreen(true)}
                                >
                                    {/* 배경 이미지 */}
                                    {posts[currentIndex].image ? (
                                        <img
                                            src={posts[currentIndex].image}
                                            alt="Post"
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.currentTarget.src = 'https://via.placeholder.com/800x600/9333ea/ffffff?text=No+Image';
                                            }}
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center">
                                            <div className="text-center text-white">
                                                <p className="text-6xl mb-4">🐾</p>
                                                <p className="text-xl font-bold">{posts[currentIndex].title}</p>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* 그라데이션 오버레이 - 기본 약하게, 호버 시 진하게 */}
                                    <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/40 group-hover:from-black/60 group-hover:to-black/80 transition-all duration-300"></div>
                                    
                                    {/* 좌측 상단 - 사용자 정보 - 호버 시에만 표시 */}
                                    <div className="absolute top-6 left-6 flex items-center space-x-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-lg">
                                            <img
                                                src={posts[currentIndex].profileImage || 'https://via.placeholder.com/150'}
                                                alt={posts[currentIndex].nickname}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white text-lg drop-shadow-lg">{posts[currentIndex].nickname}</h3>
                                            <p className="text-xs text-white/90 drop-shadow-md">{formatTimeAgo(posts[currentIndex].createdAt)}</p>
                                        </div>
                                    </div>
                                    
                                    {/* 우측 - 액션 버튼 (세로 배치) - 호버 시에만 표시 */}
                                    <div className="absolute right-6 bottom-10 flex flex-col items-center space-y-6 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <div className="flex flex-col items-center">
                                            <button 
                                                onClick={() => {
                                                    console.log('메인 피드 하트 클릭:', { 
                                                        postId: posts[currentIndex].id, 
                                                        isLiked: posts[currentIndex].isLiked,
                                                        isLiked타입: typeof posts[currentIndex].isLiked,
                                                        likeCount: posts[currentIndex].likeCount 
                                                    });
                                                    handleLikeToggle(posts[currentIndex].id, posts[currentIndex].isLiked);
                                                }}
                                                className={`hover:scale-110 transition-transform drop-shadow-lg ${
                                                    posts[currentIndex].isLiked ? 'text-red-500' : 'text-white'
                                                }`}
                                            >
                                                <FaHeart size={32} />
                                            </button>
                                            <span className="text-white text-sm font-semibold mt-1 drop-shadow-md">{formatNumber(posts[currentIndex].likeCount)}</span>
                                        </div>
                                        
                                        <div className="flex flex-col items-center">
                                            <button className="text-white hover:scale-110 transition-transform drop-shadow-lg">
                                                <FaComment size={32} />
                                            </button>
                                            <span className="text-white text-sm font-semibold mt-1 drop-shadow-md">{posts[currentIndex].commentCount}</span>
                                        </div>
                                        
                                        <button className="text-white hover:scale-110 transition-transform drop-shadow-lg">
                                            <FaShare size={32} />
                                        </button>
                                    </div>
                                    
                                    {/* 하단 - 캡션 및 태그 - 호버 시에만 표시 */}
                                    <div className="absolute bottom-6 left-6 right-24 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <p className="text-white text-base mb-2 drop-shadow-lg line-clamp-2">
                                            <span className="font-bold">{posts[currentIndex].nickname}</span> {posts[currentIndex].content}
                                        </p>
                                        
                                        <div className="flex flex-wrap gap-2">
                                            {posts[currentIndex].hashtags.map((tag: string, index: number) => (
                                                <span key={index} className="text-white/90 text-sm font-medium drop-shadow-md">#{tag}</span>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    {/* 좌우 화살표 - 호버 시에만 표시 */}
                                    <button 
                                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm rounded-full p-3 text-white hover:bg-white/30 transition-all z-30 opacity-0 group-hover:opacity-100"
                                        onClick={() => paginate(-1)}
                                    >
                                        <MdKeyboardArrowLeft size={28} />
                                    </button>
                                    <button 
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm rounded-full p-3 text-white hover:bg-white/30 transition-all z-30 opacity-0 group-hover:opacity-100"
                                        onClick={() => paginate(1)}
                                    >
                                        <MdKeyboardArrowRight size={28} />
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
                
                {/* 페이지 인디케이터 */}
                <div className="absolute -bottom-8 left-0 right-0 flex justify-center space-x-2">
                    {posts.map((_, index) => (
                        <button 
                            key={index} 
                            className={`w-2 h-2 rounded-full transition-all ${
                                index === currentIndex ? 'bg-white w-8' : 'bg-white/50'
                            }`}
                            onClick={() => {
                                setDirection(index > currentIndex ? 1 : -1);
                                setCurrentIndex(index);
                            }}
                        />
                    ))}
                </div>

            </div>

            {/* Instagram 피드 스타일 그리드 */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-600">
                            모든 게시물
                        </h2>
                        <p className="text-gray-600">다양한 반려동물들의 이야기를 만나보세요</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {posts.map((post) => (
                            <div
                                key={post.id}
                                className="relative w-full cursor-pointer group overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 bg-gray-100"
                                style={{ paddingBottom: '100%' }}
                                onClick={() => {
                                    const index = posts.findIndex(p => p.id === post.id);
                                    setDirection(index > currentIndex ? 1 : -1);
                                    setCurrentIndex(index);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                            >
                                {/* 이미지 */}
                                {post.image ? (
                                    <img
                                        src={post.image}
                                        alt={post.content}
                                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 z-10"
                                        onError={(e) => {
                                            console.error('이미지 로드 실패:', post.image);
                                            e.currentTarget.src = 'https://via.placeholder.com/400x400/9333ea/ffffff?text=No+Image';
                                        }}
                                        onLoad={() => console.log('이미지 로드 성공:', post.image)}
                                    />
                                ) : (
                                    <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center">
                                        <div className="text-center text-white">
                                            <p className="text-4xl mb-2">🐾</p>
                                            <p className="text-xs font-bold px-2">{post.title}</p>
                                        </div>
                                    </div>
                                )}
                                
                                {/* 호버 오버레이 */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                                    <div className="flex items-center space-x-6 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                console.log('그리드 하트 클릭:', { postId: post.id, isLiked: post.isLiked, likeCount: post.likeCount });
                                                handleLikeToggle(post.id, post.isLiked);
                                            }}
                                            className="flex items-center space-x-2 hover:scale-110 transition-transform"
                                        >
                                            <FaHeart 
                                                size={28} 
                                                className={`drop-shadow-lg ${post.isLiked ? 'text-red-500' : 'text-white'}`}
                                            />
                                            <span className="font-bold text-xl drop-shadow-lg">{formatNumber(post.likeCount)}</span>
                                        </button>
                                        <div className="flex items-center space-x-2">
                                            <FaComment size={28} className="drop-shadow-lg" />
                                            <span className="font-bold text-xl drop-shadow-lg">{post.commentCount}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>


        </div>
        
        {/* 전체 화면 모달 */}
        {isFullscreen && (
            <div className="fixed inset-0 z-50 bg-black flex items-center justify-center" onClick={() => setIsFullscreen(false)}>
                {/* 닫기 버튼 */}
                <button
                    className="absolute top-6 right-6 text-white text-4xl hover:text-gray-300 transition-colors z-50"
                    onClick={() => setIsFullscreen(false)}
                >
                    ×
                </button>

                {/* 이미지 */}
                <div className="relative w-full h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                    <img
                        src={posts[currentIndex].image}
                        alt="Post"
                        className="max-w-full max-h-full object-contain"
                        onDoubleClick={() => setIsFullscreen(false)}
                    />
                    
                    {/* 좌우 화살표 */}
                    <button 
                        className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm rounded-full p-4 text-white hover:bg-white/30 transition-all"
                        onClick={() => paginate(-1)}
                    >
                        <MdKeyboardArrowLeft size={36} />
                    </button>
                    <button 
                        className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm rounded-full p-4 text-white hover:bg-white/30 transition-all"
                        onClick={() => paginate(1)}
                    >
                        <MdKeyboardArrowRight size={36} />
                    </button>
                    
                    {/* 사용자 정보 */}
                    <div className="absolute top-6 left-6 flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-lg">
                            <img
                                src={posts[currentIndex].profileImage || 'https://via.placeholder.com/150'}
                                alt={posts[currentIndex].nickname}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-lg drop-shadow-lg">{posts[currentIndex].nickname}</h3>
                            <p className="text-xs text-white/90 drop-shadow-md">{formatTimeAgo(posts[currentIndex].createdAt)}</p>
                        </div>
                    </div>
                    
                    {/* 우측 하단 액션 버튼 */}
                    <div className="absolute right-6 bottom-24 flex flex-col items-center space-y-4">
                        <button
                            onClick={() => {
                                console.log('전체화면 하트 클릭:', { 
                                    postId: posts[currentIndex].id, 
                                    isLiked: posts[currentIndex].isLiked,
                                    likeCount: posts[currentIndex].likeCount 
                                });
                                handleLikeToggle(posts[currentIndex].id, posts[currentIndex].isLiked);
                            }}
                            className="flex flex-col items-center hover:scale-110 transition-transform"
                        >
                            <FaHeart 
                                size={36} 
                                className={`drop-shadow-lg ${posts[currentIndex].isLiked ? 'text-red-500' : 'text-white'}`}
                            />
                            <span className="text-white text-lg font-bold mt-2 drop-shadow-lg">{formatNumber(posts[currentIndex].likeCount)}</span>
                        </button>
                        
                        <div className="flex flex-col items-center">
                            <FaComment size={36} className="text-white drop-shadow-lg" />
                            <span className="text-white text-lg font-bold mt-2 drop-shadow-lg">{posts[currentIndex].commentCount}</span>
                        </div>
                        
                        <button className="text-white hover:scale-110 transition-transform">
                            <FaShare size={36} className="drop-shadow-lg" />
                        </button>
                    </div>
                    
                    {/* 하단 캡션 */}
                    <div className="absolute bottom-6 left-6 right-32">
                        <p className="text-white text-base mb-2 drop-shadow-lg">
                            <span className="font-bold">{posts[currentIndex].nickname}</span> {posts[currentIndex].content}
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {posts[currentIndex].hashtags.map((tag: string, index: number) => (
                                <span key={index} className="text-white/90 text-sm font-medium drop-shadow-md">#{tag}</span>
                            ))}
                        </div>
                    </div>
                </div>
                
                {/* ESC 키로 닫기 */}
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-white/70 text-sm">
                    ESC 키 또는 더블클릭으로 닫기
                </div>
            </div>
        )}

        {/* 게시물 작성 모달 */}
        <CreatePostModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onPostCreated={fetchPosts}
        />
        </>
    );
}

export default PetSns;