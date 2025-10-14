import { useState, useEffect } from 'react';
import { FaHeart, FaComment, FaEdit, FaTrash, FaExclamationCircle } from 'react-icons/fa';
import { postApi } from '../api/snsApi';
import type { Post } from '../types/post.types';
import { useAuth } from '../../shared/hooks/useAuth';

function MyPosts() {
    const { isAuthenticated, user } = useAuth();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isAuthenticated && user) {
            fetchMyPosts();
        } else {
            setLoading(false);
        }
    }, [isAuthenticated, user]);

    const fetchMyPosts = async () => {
        try {
            setLoading(true);
            if (user) {
                const response = await postApi.getUserPosts(user.accountId);
                console.log('나의 게시물 조회:', response.content);
                console.log('첫 번째 게시물 이미지:', response.content[0]?.image);
                setPosts(response.content);
            }
        } catch (error) {
            console.error('게시물 불러오기 실패:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (postId: number) => {
        if (!window.confirm('정말 삭제하시겠습니까?')) {
            return;
        }

        try {
            await postApi.deletePost(postId);
            alert('게시물이 삭제되었습니다.');
            fetchMyPosts();
        } catch (error) {
            console.error('삭제 실패:', error);
            alert('게시물 삭제에 실패했습니다.');
        }
    };

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

    if (loading) {
        return (
            <div className="pt-24 min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="pt-24 min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <FaExclamationCircle className="mx-auto text-red-500 text-6xl mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">로그인이 필요합니다</h2>
                    <p className="text-gray-600 mb-6">
                        나의 게시물을 보려면 먼저 로그인해주세요.
                    </p>
                    <button
                        onClick={() => window.location.href = '/login'}
                        className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                    >
                        로그인하기
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="pt-20 pb-16 min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* 프로필 헤더 */}
                <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
                    <div className="flex items-center space-x-6 mb-6">
                        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-purple-500 shadow-lg">
                            <img
                                src={posts[0]?.profileImage || 'https://via.placeholder.com/150'}
                                alt="프로필"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                                {posts[0]?.nickname || '나의 게시물'}
                            </h1>
                            <div className="flex items-center space-x-6 text-gray-600">
                                <div>
                                    <span className="font-bold text-2xl text-gray-800">{posts.length}</span>
                                    <span className="ml-1">게시물</span>
                                </div>
                                <div>
                                    <span className="font-bold text-2xl text-gray-800">
                                        {posts.reduce((sum, post) => sum + post.likeCount, 0)}
                                    </span>
                                    <span className="ml-1">좋아요</span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => window.location.href = '/sns'}
                            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-bold hover:shadow-lg hover:shadow-purple-500/50 transition-all hover:scale-105"
                        >
                            새 게시물
                        </button>
                    </div>
                </div>

                {/* 게시물 그리드 */}
                {posts.length === 0 ? (
                    <div className="bg-white rounded-3xl shadow-xl p-16 text-center">
                        <p className="text-6xl mb-6">📸</p>
                        <h2 className="text-2xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                            첫 게시물을 작성해보세요
                        </h2>
                        <p className="text-gray-600 mb-8">소중한 순간을 공유하고 추억을 남겨보세요</p>
                        <button
                            onClick={() => window.location.href = '/sns'}
                            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-bold hover:shadow-lg hover:shadow-purple-500/50 transition-all hover:scale-105"
                        >
                            게시물 작성하기
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {posts.map((post) => (
                            <div
                                key={post.id}
                                className="relative w-full cursor-pointer group overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 bg-gray-100"
                                style={{ paddingBottom: '100%' }}
                            >
                                {/* 이미지 */}
                                {post.image ? (
                                    <img
                                        src={post.image}
                                        alt={post.title}
                                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                        onError={(e) => {
                                            e.currentTarget.src = 'https://via.placeholder.com/400x400/9333ea/ffffff?text=No+Image';
                                        }}
                                    />
                                ) : (
                                    <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                                        <div className="text-center text-white">
                                            <p className="text-4xl mb-2">🐾</p>
                                            <p className="text-xs font-bold px-2">{post.title}</p>
                                        </div>
                                    </div>
                                )}
                                
                                {/* 호버 오버레이 */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center">
                                    {/* 통계 */}
                                    <div className="flex items-center space-x-6 text-white mb-6 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                        <div className="flex items-center space-x-2">
                                            <FaHeart size={24} className="drop-shadow-lg" />
                                            <span className="font-bold text-xl drop-shadow-lg">{post.likeCount}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <FaComment size={24} className="drop-shadow-lg" />
                                            <span className="font-bold text-xl drop-shadow-lg">{post.commentCount}</span>
                                        </div>
                                    </div>
                                    
                                    {/* 액션 버튼 */}
                                    <div className="flex space-x-3 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                window.location.href = `/sns/edit/${post.id}`;
                                            }}
                                            className="group/btn relative flex items-center space-x-2 px-5 py-2.5 bg-white/20 backdrop-blur-md text-white rounded-full hover:bg-white/30 transition-all duration-300 shadow-lg hover:shadow-white/50 border border-white/30 hover:scale-105"
                                        >
                                            <FaEdit className="group-hover/btn:rotate-12 transition-transform duration-300" />
                                            <span className="font-semibold">수정</span>
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(post.id);
                                            }}
                                            className="group/btn relative flex items-center space-x-2 px-5 py-2.5 bg-white/20 backdrop-blur-md text-white rounded-full hover:bg-red-500/90 transition-all duration-300 shadow-lg hover:shadow-red-500/50 border border-white/30 hover:scale-105"
                                        >
                                            <FaTrash className="group-hover/btn:scale-110 transition-transform duration-300" />
                                            <span className="font-semibold">삭제</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default MyPosts;
