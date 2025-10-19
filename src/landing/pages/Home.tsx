import { useNavigate } from "react-router-dom";
import { FaArrowRight, FaHeart, FaUsers, FaImage, FaComments } from "react-icons/fa";
import landingImg from '../../assets/images/landingPetImage.png';

function Home() {
    const navigate = useNavigate();

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="pt-24 pb-16 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="max-w-4xl mx-auto text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full mb-8 border border-blue-100">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-sm font-semibold text-blue-700">반려동물 전용 SNS</span>
                        </div>

                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-800 mb-8 leading-tight" style={{ letterSpacing: '-0.02em' }}>
                            반려동물과 함께하는<br />
                            일상을 공유하세요
                        </h1>

                        <p className="text-xl md:text-2xl text-gray-600 mb-12 leading-relaxed font-normal">
                            사진을 올리고, 친구들을 만들고, 소중한 추억을 기록하세요.<br />
                            MyRealPet에서 반려동물과의 모든 순간을 함께합니다.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <button
                                onClick={() => navigate('/login')}
                                className="bg-blue-600 text-white px-6 py-3.5 rounded-2xl font-semibold hover:bg-blue-700 transition-all inline-flex items-center gap-2 w-full sm:w-auto justify-center shadow-lg active:scale-95"
                            >
                                무료로 시작하기
                                <FaArrowRight className="text-sm" />
                            </button>
                            <button
                                onClick={() => scrollToSection('features')}
                                className="border-2 border-gray-200 text-gray-700 px-6 py-3.5 rounded-2xl font-semibold hover:border-gray-300 hover:bg-gray-50 transition-all w-full sm:w-auto active:scale-95"
                            >
                                더 알아보기
                            </button>
                        </div>

                        <div className="flex items-center justify-center gap-8 mt-10 text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span className="font-medium">무료 서비스</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span className="font-medium">신용카드 불필요</span>
                            </div>
                        </div>
                    </div>

                    {/* Hero Image */}
                    <div className="max-w-5xl mx-auto">
                        <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-200">
                            <img
                                src={landingImg}
                                alt="Pet"
                                className="w-full h-auto"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section id="features" className="py-24 px-6 bg-gray-50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                            반려동물 SNS의 핵심 기능
                        </h2>
                        <p className="text-lg text-gray-600 font-normal">
                            필요한 모든 것이 하나의 플랫폼에
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {/* Feature 1 */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                                <FaImage className="text-blue-600 text-xl" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                사진 공유
                            </h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                반려동물의 일상을 사진으로 기록하고 공유하세요
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
                            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                                <FaUsers className="text-emerald-600 text-xl" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                친구 만들기
                            </h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                같은 반려동물을 키우는 사람들과 연결되세요
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
                            <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
                                <FaHeart className="text-pink-600 text-xl" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                좋아요 & 반응
                            </h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                마음에 드는 게시물에 좋아요를 눌러보세요
                            </p>
                        </div>

                        {/* Feature 4 */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                                <FaComments className="text-purple-600 text-xl" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                댓글로 소통
                            </h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                게시물에 댓글을 달며 활발히 교류하세요
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section className="py-24 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                            간단한 3단계로 시작
                        </h2>
                        <p className="text-lg text-gray-600 font-normal">
                            3분이면 충분합니다
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg">
                                1
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-3">
                                회원가입
                            </h3>
                            <p className="text-gray-600 font-normal">
                                이메일로 간편하게 가입하세요
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg">
                                2
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-3">
                                프로필 만들기
                            </h3>
                            <p className="text-gray-600 font-normal">
                                반려동물 정보를 등록하세요
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg">
                                3
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-3">
                                일상 공유
                            </h3>
                            <p className="text-gray-600 font-normal">
                                사진을 올리고 소통하세요
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* About Community */}
            <section id="about" className="py-24 px-6 bg-gradient-to-b from-blue-600 to-blue-700">
                <div className="max-w-7xl mx-auto">
                    <div className="max-w-3xl mx-auto text-center">
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                            지금 바로 시작하세요
                        </h2>
                        <p className="text-xl text-blue-100 mb-10 leading-relaxed font-normal">
                            전국의 반려인들이 매일 이야기를 나누고 있습니다.<br />
                            가입 무료 · 신용카드 불필요 · 3분 내 시작
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <button
                                onClick={() => navigate('/login')}
                                className="bg-white text-blue-700 px-6 py-3.5 rounded-2xl font-semibold hover:bg-blue-50 transition-all inline-flex items-center gap-2 shadow-lg active:scale-95"
                            >
                                회원가입
                                <FaArrowRight />
                            </button>
                            <button
                                onClick={() => navigate('/sns')}
                                className="bg-blue-600 text-white px-6 py-3.5 rounded-2xl font-semibold hover:bg-blue-700 transition-all inline-flex items-center gap-2 shadow-lg active:scale-95"
                            >
                                둘러보기
                                <FaArrowRight />
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Home;
