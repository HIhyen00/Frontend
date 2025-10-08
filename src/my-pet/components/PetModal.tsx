import {useState, useEffect, type ChangeEvent, useRef} from "react";
import type {Pet} from "../types/types.ts";

interface PetFormData {
    id?: number;
    type: 'dog' | 'cat' | 'other';
    name: string;
    gender: '남아' | '여아' | '정보없음';
    mainBreed: string;
    subBreed?: string | null;
    customBreed?: string;
    dob: string;
    imageDataUrl?: string | null;
    isNeutered?: boolean;
    hasMicrochip?: boolean;
    registrationNumber?: string;
    registrationFile?: File | null;
}

interface PetModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (petData: PetFormData) => void;
    mode: 'add' | 'edit';
    pet: Pet | null;
}

const DOG_BREEDS = [
    '푸들', '말티즈', '요크셔테리어', '치와와', '시바견', '진돗개', '포메라니안',
    '골든리트리버', '래브라도리트리버', '허스키', '보더콜리','비숑 프리제', '직접입력'
]
const CAT_BREEDS = [
    '코리안숏헤어', '랙돌', '페르시안', '러시안블루', '브리티쉬숏헤어', '메인쿤',
    '스코티쉬폴드', '아메리칸숏헤어', '터키시앙고라', '벵갈', '샴', '노르웨이숲', '직접입력'
]

const PetModal: React.FC<PetModalProps> = ({isOpen, onClose, onSave, mode, pet}) => {
    const [type, setType] = useState<'dog' | 'cat' | 'other'>('dog');
    const [gender, setGender] = useState<'남아' | '여아' | '정보없음'>('정보없음');

    const [name, setName] = useState('');
    const [mainBreed, setMainBreed] = useState('');
    const [subBreed, setSubBreed] = useState('');
    const [customBreed, setCustomBreed] = useState('');
    const [showCustomBreed, setShowCustomBreed] = useState(false);
    const [dob, setDob] = useState('');
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isNeutered, setIsNeutered] = useState<boolean>(false);
    const [hasMicrochip, setHasMicrochip] = useState<boolean>(false);
    const [registrationNumber, setRegistrationNumber] = useState('');
    const [registrationFile, setRegistrationFile] = useState<File | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const registrationInputRef = useRef<HTMLInputElement>(null);


    useEffect(() => {
        if (isOpen) {
            if (mode === 'edit' && pet) {
                setType(pet.type);
                setGender(pet.gender);
                setName(pet.name);
                setMainBreed(pet.mainBreed);
                setSubBreed(pet.subBreed || '');
                setCustomBreed(pet.customBreed || '');
                setDob(pet.dob);
                setImagePreview(pet.imageUrl);
                setIsNeutered(pet.isNeutered || false);
                setHasMicrochip(pet.hasMicrochip || false);
                setRegistrationNumber(pet.registrationNum || '');
                setRegistrationFile(null);

                if (pet.type === 'other') {
                    setShowCustomBreed(true);
                } else if (pet.mainBreed === '직접입력' || !DOG_BREEDS.concat(CAT_BREEDS).includes(pet.mainBreed)) {
                    setShowCustomBreed(true);
                    setMainBreed('직접입력');
                } else {
                    setShowCustomBreed(false);
                }
            } else {
                setType('dog');
                setGender('정보없음');
                setName('');
                setMainBreed('');
                setSubBreed('');
                setCustomBreed('');
                setShowCustomBreed(false);
                setDob('');
                setImagePreview(null);
                setIsNeutered(false);
                setHasMicrochip(false);
                setRegistrationNumber('');
                setRegistrationFile(null);
            }
        }
    }, [isOpen, mode, pet]);

    if (!isOpen) return null;

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRegistrationFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setRegistrationFile(e.target.files[0]);
        }
    };

    const handleMainBreedChange = (selectedBreed: string) => {
        setMainBreed(selectedBreed);
        setSubBreed(''); // mainBreed가 변경되면 subBreed 초기화
        if (selectedBreed === '직접입력') {
            setShowCustomBreed(true);
        } else {
            setShowCustomBreed(false);
            setCustomBreed('');
        }
    };

    const handleTypeChange = (newType: 'dog' | 'cat' | 'other') => {
        setType(newType);
        setMainBreed('');
        setSubBreed('');
        setCustomBreed('');
        setShowCustomBreed(newType === 'other');
    };

    const getCurrentBreeds = () => {
        if (type === 'dog') return DOG_BREEDS;
        if (type === 'cat') return CAT_BREEDS;
        return [];
    };

    const getAvailableSubBreeds = () => {
        if (type === 'other' || !mainBreed || mainBreed === '직접입력') {
            return [];
        }
        // mainBreed를 제외한 품종들을 subBreed 옵션으로 제공
        return getCurrentBreeds().filter(breed => breed !== mainBreed && breed !== '직접입력');
    };

    const handleSave = () => {
        onSave({
            id: pet?.id,
            type,
            gender,
            name,
            mainBreed: showCustomBreed || type === 'other' ? customBreed : mainBreed,
            subBreed: subBreed || null,
            customBreed,
            dob,
            imageDataUrl: imagePreview,
            isNeutered,
            hasMicrochip,
            registrationNumber,
            registrationFile,
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
            <div className="bg-white rounded-2xl p-4 w-full max-w-lg shadow-xl animate-fade-in-scale">
                <div className="p-2 max-h-[90vh] overflow-y-auto">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">{mode === 'add' ? '새 펫 등록' : '펫 정보 수정'}</h2>

                    {/* 이미지 업로드 UI */}
                    <div className="flex flex-col items-center mb-6">
                        <div
                            className="w-40 h-40 rounded-full bg-gray-100 mb-4 overflow-hidden flex items-center justify-center cursor-pointer border-2 border-dashed border-gray-300 hover:border-indigo-400 transition"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {imagePreview ? (
                                <img src={imagePreview} alt="펫 미리보기" className="w-full h-full object-cover"/>
                            ) : (
                                <div className="text-center text-gray-500">
                                    <i className="fas fa-camera text-4xl"></i>
                                    <p className="mt-2 text-sm">사진 추가하기</p>
                                </div>
                            )}
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageChange}
                        />
                    </div>

                    {/* 강아지/고양이 선택 UI */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">종류</label>
                        <div className="flex gap-2 sm:gap-4">
                            {/* 강아지 버튼 */}
                            <button
                                onClick={() => handleTypeChange('dog')}
                                className={`flex-1 py-3 px-2 sm:px-4 rounded-lg border-2 transition text-center ${
                                    type === 'dog'
                                        ? 'bg-indigo-500 border-indigo-500 text-white shadow-lg'
                                        : 'bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                <i className="fas fa-dog sm:mr-2"></i>
                                <span className="hidden sm:inline">강아지</span>
                            </button>
                            {/* 고양이 버튼 */}
                            <button
                                onClick={() => handleTypeChange('cat')}
                                className={`flex-1 py-3 px-2 sm:px-4 rounded-lg border-2 transition text-center ${
                                    type === 'cat'
                                        ? 'bg-orange-500 border-orange-500 text-white shadow-lg'
                                        : 'bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                <i className="fas fa-cat sm:mr-2"></i>
                                <span className="hidden sm:inline">고양이</span>
                            </button>
                            {/* 기타 버튼 */}
                            <button
                                onClick={() => handleTypeChange('other')}
                                className={`flex-1 py-3 px-2 sm:px-4 rounded-lg border-2 transition text-center ${
                                    type === 'other'
                                        ? 'bg-gray-500 border-gray-500 text-white shadow-lg'
                                        : 'bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                <i className="fas fa-paw sm:mr-2"></i>
                                <span className="hidden sm:inline">기타</span>
                            </button>
                        </div>
                    </div>

                    {/* 성별 영역 */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">성별</label>
                        <div className="flex gap-2 sm:gap-4">
                            <button
                                onClick={() => setGender('남아')}
                                className={`flex-1 py-3 px-2 sm:px-4 rounded-lg border-2 transition text-center ${
                                    gender === '남아'
                                    ? 'bg-blue-500 border-blue-500 text-white shadow-lg'
                                    : 'bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                <i className="fas fa-mars sm:mr-2"></i>
                                <span className="hidden sm:inline">남아</span>
                            </button>
                            <button
                                onClick={() => setGender('여아')}
                                className={`flex-1 py-3 px-2 sm:px-4 rounded-lg border-2 transition text-center ${
                                    gender === '여아'
                                        ? 'bg-pink-500 border-pink-500 text-white shadow-lg'
                                        : 'bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                <i className="fas fa-venus sm:mr-2"></i>
                                <span className="hidden sm:inline">여아</span>
                            </button>
                            <button
                                onClick={() => setGender('정보없음')}
                                className={`flex-1 py-3 px-2 sm:px-4 rounded-lg border-2 transition text-center ${
                                    gender === '정보없음'
                                    ? 'bg-gray-500 border-gray-500 text-white shadow-lg'
                                        : 'bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                <i className="fas fa-question sm:mr-2"></i>
                                <span className="hidden sm:inline">모름</span>
                            </button>
                        </div>
                    </div>

                    {/* 이름, 품종, 생일 등 입력 필드 */}
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="petName" className="block text-sm font-medium text-gray-700 mb-1">이름</label>
                            <input
                                type="text"
                                id="petName"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                                placeholder="펫의 이름을 입력해주세요"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">품종</label>
                            {type === 'other' ? (
                                <input
                                    type="text"
                                    value={customBreed}
                                    onChange={(e) => setCustomBreed(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                                    placeholder="품종을 입력해주세요"
                                />
                            ) : (
                                <>
                                    <select
                                        value={mainBreed}
                                        onChange={(e) => handleMainBreedChange(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition appearance-none bg-white"
                                    >
                                        <option value="">주품종을 선택해주세요</option>
                                        {getCurrentBreeds().map((breedOption) => (
                                            <option key={breedOption} value={breedOption}>
                                                {breedOption}
                                            </option>
                                        ))}
                                    </select>
                                    {showCustomBreed && (
                                        <input
                                            type="text"
                                            value={customBreed}
                                            onChange={(e) => setCustomBreed(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition mt-2"
                                            placeholder="품종을 직접 입력해주세요"
                                        />
                                    )}
                                </>
                            )}
                        </div>

                        {type !== 'other' && mainBreed && mainBreed !== '직접입력' && !showCustomBreed && (
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    서브품종 <span className="text-gray-500 text-xs">(선택사항, 믹스견의 경우)</span>
                                </label>
                                <select
                                    value={subBreed}
                                    onChange={(e) => setSubBreed(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition appearance-none bg-white"
                                >
                                    <option value="">서브품종 선택 (선택사항)</option>
                                    {getAvailableSubBreeds().map((breedOption) => (
                                        <option key={breedOption} value={breedOption}>
                                            {breedOption}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div>
                            <label htmlFor="petDob"
                                   className="block text-sm font-medium text-gray-700 mb-1">생년월일</label>
                            <input
                                type="date"
                                id="petDob"
                                value={dob}
                                onChange={(e) => setDob(e.target.value)}
                                className="w-full px-4 py-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                            />
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">중성화 여부</label>
                        <div className="flex gap-2 sm:gap-4">
                            <button
                                onClick={() => setIsNeutered(false)}
                                className={`flex-1 py-3 px-2 sm:px-4 rounded-lg border-2 transition text-center ${
                                    !isNeutered
                                        ? 'bg-gray-500 border-gray-500 text-white'
                                        : 'bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                중성화 전
                            </button>
                            <button
                                onClick={() => setIsNeutered(true)}
                                className={`flex-1 py-3 px-2 sm:px-4 rounded-lg border-2 transition text-center ${
                                    isNeutered
                                        ? 'bg-gray-500 border-gray-500 text-white'
                                        : 'bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                중성화 완료
                            </button>
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">마이크로칩 여부</label>
                        <div className="flex gap-2 sm:gap-4">
                            <button
                                onClick={() => setHasMicrochip(false)}
                                className={`flex-1 py-3 px-2 sm:px-4 rounded-lg border-2 transition text-center ${
                                    !hasMicrochip
                                        ? 'bg-gray-500 border-gray-500 text-white'
                                        : 'bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                마이크로칩 등록 전
                            </button>
                            <button
                                onClick={() => setHasMicrochip(true)}
                                className={`flex-1 py-3 px-2 sm:px-4 rounded-lg border-2 transition text-center ${
                                    hasMicrochip
                                        ? 'bg-gray-500 border-gray-500 text-white'
                                        : 'bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                마이크로칩 등록 완료
                            </button>
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">동물등록증번호</label>
                        <input
                            type="text"
                            value={registrationNumber}
                            onChange={(e) => setRegistrationNumber(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                            placeholder="동물등록증번호를 입력해주세요"
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">동물 등록증 첨부</label>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => registrationInputRef.current?.click()}
                                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                            >
                                <i className="fas fa-paperclip text-gray-500"></i>
                                <span className="text-sm text-gray-600">
                                    {registrationFile ? registrationFile.name : '파일 선택'}
                                </span>
                            </button>
                            {registrationFile && (
                                <button
                                    onClick={() => setRegistrationFile(null)}
                                    className="text-red-500 text-sm hover:text-red-600"
                                >
                                    삭제
                                </button>
                            )}
                        </div>
                        <input
                            type="file"
                            ref={registrationInputRef}
                            className="hidden"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={handleRegistrationFileChange}
                        />
                    </div>

                    <div className="flex justify-end gap-4 mt-8">
                        <button onClick={onClose}
                                className="py-2 px-6 bg-gray-200 rounded-lg hover:bg-gray-300 transition">취소
                        </button>
                        <button onClick={handleSave}
                                className="py-2 px-6 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition">저장
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PetModal;
