import { useState } from 'react';
import { FaTimes, FaImage, FaExclamationCircle } from 'react-icons/fa';
import { postApi, uploadApi } from '../api/snsApi';
import type { PostRequest } from '../types/post.types';
import { useAuth } from '../../shared/hooks/useAuth';

interface CreatePostModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPostCreated: () => void;
}

function CreatePostModal({ isOpen, onClose, onPostCreated }: CreatePostModalProps) {
    const { isAuthenticated } = useAuth();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [hashtags, setHashtags] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string>('');

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // 로그인 확인
        if (!isAuthenticated) {
            setError('로그인이 필요합니다.');
            return;
        }

        try {
            setIsUploading(true);
            setError('');
            
            let imageUrl = '';
            if (imageFile) {
                // 이미지 업로드
                console.log('이미지 업로드 시작:', imageFile.name, imageFile.size);
                imageUrl = await uploadApi.uploadImage(imageFile, 'post');
                console.log('이미지 업로드 완료:', imageUrl);
            }

            // 해시태그 파싱
            const hashtagArray = hashtags
                .split('#')
                .map(tag => tag.trim())
                .filter(tag => tag.length > 0);

            // 게시물 생성
            const postData: PostRequest = {
                title,
                content,
                image: imageUrl,
                hashtags: hashtagArray,
            };

            console.log('게시물 생성 요청:', postData);
            const response = await postApi.createPost(postData);
            console.log('게시물 생성 응답:', response);
            
            // 성공 후 초기화
            setTitle('');
            setContent('');
            setHashtags('');
            setImageFile(null);
            setImagePreview('');
            
            onPostCreated();
            onClose();
        } catch (error: any) {
            console.error('게시물 작성 실패:', error);
            if (error.response?.status === 401) {
                setError('로그인이 만료되었습니다. 다시 로그인해주세요.');
            } else {
                setError('게시물 작성에 실패했습니다. 다시 시도해주세요.');
            }
        } finally {
            setIsUploading(false);
        }
    };

    if (!isOpen) return null;

    // 로그인하지 않은 경우
    if (!isAuthenticated) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
                <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 text-center border border-gray-100">
                    <FaExclamationCircle className="mx-auto text-red-500 text-6xl mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">로그인이 필요합니다</h2>
                    <p className="text-gray-600 mb-6">
                        게시물을 작성하려면 먼저 로그인해주세요.
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-2xl font-semibold text-sm transition-all active:scale-95"
                        >
                            닫기
                        </button>
                        <button
                            onClick={() => window.location.href = '/login'}
                            className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-semibold text-sm transition-all shadow-lg active:scale-95"
                        >
                            로그인하기
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4" onClick={onClose}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-100" onClick={(e) => e.stopPropagation()}>
                {/* 헤더 */}
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-2xl font-bold text-gray-800">새 게시물 작성</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        <FaTimes size={24} />
                    </button>
                </div>

                {/* 폼 */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* 에러 메시지 */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center space-x-2">
                            <FaExclamationCircle />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* 제목 */}
                    <div>
                        <label className="block text-xs font-bold text-gray-900 mb-2.5 uppercase tracking-wider">
                            제목 <span className="text-red-600">*</span>
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-3.5 border border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm shadow-sm"
                            placeholder="제목을 입력하세요"
                            required
                        />
                    </div>

                    {/* 내용 */}
                    <div>
                        <label className="block text-xs font-bold text-gray-900 mb-2.5 uppercase tracking-wider">
                            내용 <span className="text-red-600">*</span>
                        </label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full px-4 py-3.5 border border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none text-sm shadow-sm"
                            rows={5}
                            placeholder="내용을 입력하세요"
                            required
                        />
                    </div>

                    {/* 해시태그 */}
                    <div>
                        <label className="block text-xs font-bold text-gray-900 mb-2.5 uppercase tracking-wider">
                            해시태그
                        </label>
                        <input
                            type="text"
                            value={hashtags}
                            onChange={(e) => setHashtags(e.target.value)}
                            className="w-full px-4 py-3.5 border border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm shadow-sm"
                            placeholder="#강아지 #고양이 #반려동물"
                        />
                    </div>

                    {/* 이미지 업로드 */}
                    <div>
                        <label className="block text-xs font-bold text-gray-900 mb-2.5 uppercase tracking-wider">
                            이미지
                        </label>
                        <div className="flex items-center space-x-4">
                            <label className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-2xl cursor-pointer hover:bg-blue-700 transition-all shadow-lg active:scale-95 font-semibold text-sm">
                                <FaImage />
                                <span>이미지 선택</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </label>
                            {imageFile && (
                                <span className="text-sm text-gray-600 font-medium">{imageFile.name}</span>
                            )}
                        </div>

                        {/* 이미지 미리보기 */}
                        {imagePreview && (
                            <div className="mt-4">
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="w-full h-64 object-cover rounded-2xl border border-gray-200"
                                />
                            </div>
                        )}
                    </div>

                    {/* 버튼 */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-2xl font-semibold text-sm transition-all active:scale-95"
                            disabled={isUploading}
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-2xl font-semibold text-sm transition-all shadow-lg active:scale-95"
                            disabled={isUploading}
                        >
                            {isUploading ? '업로드 중...' : '게시하기'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CreatePostModal;
