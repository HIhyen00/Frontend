import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaPaw, FaHeart, FaUserFriends, FaCalendarAlt, FaClipboardList, FaComments, FaArrowRight, FaPlay, FaQuoteLeft, FaStar } from "react-icons/fa";
import { MdPets, MdHealthAndSafety, MdOutlineLocalGroceryStore } from "react-icons/md";
import imge from '../../assets/images/landingPetImage.png';
import { RiHeartPulseFill } from "react-icons/ri";

function Home() {
    const [activeTab, setActiveTab] = useState<'sns' | 'management'>('sns');
    const [isVisible, setIsVisible] = useState(false);
    const navigate = useNavigate();
    
    useEffect(() => {
        // 페이지 로드 후 애니메이션 효과를 위한 타이머
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 100);
        
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-purple-700 text-white py-24 md:py-32 w-full">
                {/* 장식적인 요소들 */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                    <div className="absolute top-[10%] left-[5%] w-64 h-64 rounded-full bg-blue-400 mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                    <div className="absolute top-[20%] right-[10%] w-72 h-72 rounded-full bg-purple-400 mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
                    <div className="absolute bottom-[10%] left-[30%] w-80 h-80 rounded-full bg-pink-400 mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
                </div>
                
                <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between relative z-10">
                    <div className={`md:w-1/2 mb-10 md:mb-0 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                        <div className="inline-block mb-4 px-4 py-1 bg-white bg-opacity-20 backdrop-blur-sm rounded-full">
                            <p className="text-sm font-medium flex items-center text-black">
                                <RiHeartPulseFill className="mr-2 text-pink-300 "  />
                                반려동물을 위한 최고의 선택
                            </p>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                            펫과 함께하는 <br />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-300 to-blue-300">행복한 일상</span>
                        </h1>
                        <p className="text-xl mb-8 text-blue-50 max-w-lg">
                            당신의 소중한 반려동물과 함께하는 모든 순간을 기록하고 관리하며 다른 반려인들과 공유하세요.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <button 
                                onClick={() => navigate('/login')}
                                className="bg-white text-purple-700 px-8 py-4 rounded-full font-semibold hover:shadow-lg hover:shadow-purple-500/30 transition duration-300 flex items-center group"
                            >
                                <FaPaw className="mr-2" /> 
                                시작하기
                                <FaArrowRight className="ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                            </button>
                            <button className="bg-transparent border-2 border-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-purple-700 transition duration-300 flex items-center">
                                <FaPlay className="mr-2" /> 서비스 살펴보기
                            </button>
                        </div>
                        <div className="mt-8 flex items-center">
                            <div className="flex -space-x-2">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className={`w-8 h-8 rounded-full border-2 border-white bg-gray-${300 + i*100} overflow-hidden`}></div>
                                ))}
                            </div>
                            <p className="ml-4 text-sm">
                                <span className="font-bold">1,000+</span> 행복한 반려인들이 사용 중
                            </p>
                        </div>
                    </div>
                    
                    <div className={`md:w-1/2 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                        <div className="relative">
                            <div className="absolute -top-6 -left-6 w-24 h-24 bg-gradient-to-br from-pink-400 to-purple-500 rounded-lg rotate-12 opacity-50 blur-lg"></div>
                            <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg -rotate-12 opacity-50 blur-lg"></div>
                            
                            <div className="bg-white p-3 rounded-2xl shadow-2xl relative z-10 backdrop-blur-sm bg-opacity-80">
                                {/* 이미지 자리 */}
                                <div className="bg-gradient-to-br from-purple-50 to-blue-50 h-72 md:h-96 rounded-xl flex items-center justify-center overflow-hidden relative">
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        {/*<FaPaw className="text-9xl text-purple-200" />*/}
                                        <img src={imge} style={{ width: '100%', height: '100%' }} />

                                    </div>
                                    {/*<div className="relative z-10 text-center px-6">*/}
                                    {/*    <MdPets className="text-7xl text-purple-600 mx-auto mb-4" />*/}
                                    {/*    <span className="text-gray-600 text-xl font-medium block">귀여운 반려동물 이미지</span>*/}
                                    {/*</div>*/}
                                </div>
                                
                                {/* 하단 기능 아이콘 */}

                            </div>
                            
                            {/* 장식요소 */}

                        </div>
                    </div>
                </div>
                
                {/* 경사된 배경 하단 */}
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-b from-transparent to-white"></div>
            </section>

            {/* Features Section */}
            <section className="py-24 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <span className="text-purple-600 font-semibold text-sm uppercase tracking-wider">FEATURES</span>
                        <h2 className="text-4xl font-bold mt-2 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500">My Real Pet</h2>
                        <p className="text-gray-600 text-lg">반려동물과 함께하는 생활을 더 행복하고 편리하게 만들어드립니다.</p>
                    </div>
                    
                    <div className="flex justify-center mb-12">
                        <div className="inline-flex rounded-full bg-white shadow-md p-1.5">
                            <button 
                                onClick={() => setActiveTab('sns')}
                                className={`px-8 py-3 rounded-full font-medium transition-all duration-300 ${activeTab === 'sns' 
                                    ? 'bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-lg' 
                                    : 'text-gray-600 hover:text-purple-600'}`}
                            >
                                <span className="flex items-center"><FaComments className="mr-2" /> 펫 SNS</span>
                            </button>
                            <button 
                                onClick={() => setActiveTab('management')}
                                className={`px-8 py-3 rounded-full font-medium transition-all duration-300 ${activeTab === 'management' 
                                    ? 'bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-lg' 
                                    : 'text-gray-600 hover:text-purple-600'}`}
                            >
                                <span className="flex items-center"><FaClipboardList className="mr-2" /> 펫 관리</span>
                            </button>
                        </div>
                    </div>
                    
                    <div className="mt-8">
                        {activeTab === 'sns' && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-b from-blue-100 to-transparent rounded-bl-full opacity-70 -z-10"></div>
                                    <div className="bg-blue-100 p-4 rounded-xl inline-block mb-6 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300">
                                        <FaUserFriends className="text-3xl text-blue-500 group-hover:text-white" />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-3 group-hover:text-blue-500 transition-colors">반려동물 친구 만들기</h3>
                                    <p className="text-gray-600 leading-relaxed">같은 종류의 반려동물을 키우는 이웃들과 소통하고 정보를 공유하세요. 산책 모임이나 다양한 활동을 함께 즐길 수 있습니다.</p>
                                    <a href="#" className="inline-flex items-center mt-4 text-blue-500 font-medium hover:text-blue-600 transition-colors">
                                        더 알아보기 <FaArrowRight className="ml-1 text-sm" />
                                    </a>
                                </div>
                                <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-b from-purple-100 to-transparent rounded-bl-full opacity-70 -z-10"></div>
                                    <div className="bg-purple-100 p-4 rounded-xl inline-block mb-6 group-hover:bg-purple-500 group-hover:text-white transition-all duration-300">
                                        <FaComments className="text-3xl text-purple-500 group-hover:text-white" />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-3 group-hover:text-purple-500 transition-colors">일상 공유</h3>
                                    <p className="text-gray-600 leading-relaxed">반려동물과의 특별한 순간을 사진과 이야기로 공유하세요. 귀여운 사진과 재미있는 스토리로 다른 사람들과 추억을 나누세요.</p>
                                    <a href="#" className="inline-flex items-center mt-4 text-purple-500 font-medium hover:text-purple-600 transition-colors">
                                        더 알아보기 <FaArrowRight className="ml-1 text-sm" />
                                    </a>
                                </div>
                                <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-b from-pink-100 to-transparent rounded-bl-full opacity-70 -z-10"></div>
                                    <div className="bg-pink-100 p-4 rounded-xl inline-block mb-6 group-hover:bg-pink-500 group-hover:text-white transition-all duration-300">
                                        <FaHeart className="text-3xl text-pink-500 group-hover:text-white" />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-3 group-hover:text-pink-500 transition-colors">좋아요와 댓글</h3>
                                    <p className="text-gray-600 leading-relaxed">다른 반려동물 친구들의 게시물에 좋아요와 댓글을 남겨보세요. 소통하며 새로운 친구를 만들고 정보를 공유할 수 있습니다.</p>
                                    <a href="#" className="inline-flex items-center mt-4 text-pink-500 font-medium hover:text-pink-600 transition-colors">
                                        더 알아보기 <FaArrowRight className="ml-1 text-sm" />
                                    </a>
                                </div>
                            </div>
                        )}
                        
                        {activeTab === 'management' && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-b from-green-100 to-transparent rounded-bl-full opacity-70 -z-10"></div>
                                    <div className="bg-green-100 p-4 rounded-xl inline-block mb-6 group-hover:bg-green-500 group-hover:text-white transition-all duration-300">
                                        <MdHealthAndSafety className="text-3xl text-green-500 group-hover:text-white" />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-3 group-hover:text-green-500 transition-colors">건강 관리</h3>
                                    <p className="text-gray-600 leading-relaxed">예방접종, 약물 복용, 건강 검진 등 반려동물의 건강 기록을 관리하세요. 중요한 일정을 잊지 않고 반려동물의 건강을 지켜주세요.</p>
                                    <a href="#" className="inline-flex items-center mt-4 text-green-500 font-medium hover:text-green-600 transition-colors">
                                        더 알아보기 <FaArrowRight className="ml-1 text-sm" />
                                    </a>
                                </div>
                                <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-b from-yellow-100 to-transparent rounded-bl-full opacity-70 -z-10"></div>
                                    <div className="bg-yellow-100 p-4 rounded-xl inline-block mb-6 group-hover:bg-yellow-500 group-hover:text-white transition-all duration-300">
                                        <FaCalendarAlt className="text-3xl text-yellow-500 group-hover:text-white" />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-3 group-hover:text-yellow-500 transition-colors">일정 관리</h3>
                                    <p className="text-gray-600 leading-relaxed">산책, 미용, 병원 방문 등 중요한 일정을 놓치지 마세요. 알림 기능을 통해 중요한 일정을 새길 일 없이 관리할 수 있습니다.</p>
                                    <a href="#" className="inline-flex items-center mt-4 text-yellow-500 font-medium hover:text-yellow-600 transition-colors">
                                        더 알아보기 <FaArrowRight className="ml-1 text-sm" />
                                    </a>
                                </div>
                                <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-b from-orange-100 to-transparent rounded-bl-full opacity-70 -z-10"></div>
                                    <div className="bg-orange-100 p-4 rounded-xl inline-block mb-6 group-hover:bg-orange-500 group-hover:text-white transition-all duration-300">
                                        <MdOutlineLocalGroceryStore className="text-3xl text-orange-500 group-hover:text-white" />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-3 group-hover:text-orange-500 transition-colors">식품 및 용품 관리</h3>
                                    <p className="text-gray-600 leading-relaxed">사료, 간식, 장난감 등의 구매 주기를 설정하고 알림을 받으세요. 필요한 시기에 자동으로 알려드립니다.</p>
                                    <a href="#" className="inline-flex items-center mt-4 text-orange-500 font-medium hover:text-orange-600 transition-colors">
                                        더 알아보기 <FaArrowRight className="ml-1 text-sm" />
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-24 bg-gradient-to-b from-white to-gray-50">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <span className="text-purple-600 font-semibold text-sm uppercase tracking-wider">TESTIMONIALS</span>
                        <h2 className="text-4xl font-bold mt-2 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500">사용자 후기</h2>
                        <p className="text-gray-600 text-lg">행복한 반려인들이 남긴 진심 어린 후기를 만나보세요.</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 relative">
                            <div className="absolute top-6 left-6 text-purple-200">
                                <FaQuoteLeft className="text-4xl opacity-50" />
                            </div>
                            <div className="relative">
                                <div className="flex items-center mb-6">
                                    <div className="w-16 h-16 bg-gradient-to-r from-purple-300 to-blue-300 rounded-full mr-4 flex items-center justify-center text-white text-xl font-bold">
                                        김
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-bold text-gray-800">김민지</h4>
                                        <p className="text-purple-600">포메라니안 '몽이' 보호자</p>
                                    </div>
                                </div>
                                <p className="text-gray-600 leading-relaxed mb-6 text-lg">"몽이의 건강 기록을 한 곳에서 관리할 수 있어서 너무 편리해요. 병원 방문 알림 덕분에 예방접종 시기를 놓치지 않게 되었어요!"</p>
                                <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                        <FaStar key={i} className="text-yellow-400 mr-1" />
                                    ))}
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 relative md:mt-8">
                            <div className="absolute top-6 left-6 text-blue-200">
                                <FaQuoteLeft className="text-4xl opacity-50" />
                            </div>
                            <div className="relative">
                                <div className="flex items-center mb-6">
                                    <div className="w-16 h-16 bg-gradient-to-r from-blue-300 to-green-300 rounded-full mr-4 flex items-center justify-center text-white text-xl font-bold">
                                        이
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-bold text-gray-800">이준호</h4>
                                        <p className="text-blue-600">골든리트리버 '초코' 보호자</p>
                                    </div>
                                </div>
                                <p className="text-gray-600 leading-relaxed mb-6 text-lg">"초코와 비슷한 또래의 골든리트리버 친구들을 만나게 되어 너무 좋아요. 함께 산책하는 모임도 만들었답니다!"</p>
                                <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                        <FaStar key={i} className="text-yellow-400 mr-1" />
                                    ))}
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 relative">
                            <div className="absolute top-6 left-6 text-pink-200">
                                <FaQuoteLeft className="text-4xl opacity-50" />
                            </div>
                            <div className="relative">
                                <div className="flex items-center mb-6">
                                    <div className="w-16 h-16 bg-gradient-to-r from-pink-300 to-red-300 rounded-full mr-4 flex items-center justify-center text-white text-xl font-bold">
                                        박
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-bold text-gray-800">박서연</h4>
                                        <p className="text-pink-600">코리안숏헤어 '나비' 보호자</p>
                                    </div>
                                </div>
                                <p className="text-gray-600 leading-relaxed mb-6 text-lg">"나비의 사료 구매 주기를 설정해두니 알아서 알림이 와서 편리해요. 다른 고양이 집사들과 정보 공유도 할 수 있어 만족스럽습니다."</p>
                                <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                        <FaStar key={i} className={i < 4 ? "text-yellow-400 mr-1" : "text-gray-300 mr-1"} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
}

export default Home;