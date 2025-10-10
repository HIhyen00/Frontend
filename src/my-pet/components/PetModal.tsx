import { useState, useEffect, type ChangeEvent, useRef } from "react";
import type { Pet } from "../types/types.ts";
import { breedApi, type Species } from "../utils/petApi.ts";

interface PetFormData {
    id?: number;
    type: 'dog' | 'cat' | 'other';
    name: string;
    gender: '남아' | '여아' | '정보없음';
    mainBreed: string;
    mainBreedId?: number;
    subBreed?: string | null;
    subBreedId?: number;
    customBreed?: string | null;
    dob: string;
    imageDataUrl?: string | null;
    imageFile?: File | null;
    deleteProfileImg?: boolean;
    isNeutered?: boolean;
    hasMicrochip?: boolean;
    registrationNumber?: string;
    registrationFile?: File | null;
    deleteRegistrationPdf?: boolean;
}

interface PetModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (petData: PetFormData) => void;
    mode: 'add' | 'edit';
    pet: Pet | null;
}

interface Breed {
    id: number;
    name: string;
    species: Species;
}

const PetModal: React.FC<PetModalProps> = ({ isOpen, onClose, onSave, mode, pet }) => {
    const [type, setType] = useState<'dog' | 'cat' | 'other'>('dog');
    const [gender, setGender] = useState<'남아' | '여아' | '정보없음'>('정보없음');
    const [name, setName] = useState('');
    const [mainBreed, setMainBreed] = useState('');
    const [mainBreedId, setMainBreedId] = useState<number | undefined>(undefined);
    const [subBreed, setSubBreed] = useState('');
    const [subBreedId, setSubBreedId] = useState<number | undefined>(undefined);
    const [customBreed, setCustomBreed] = useState('');
    const [showCustomBreed, setShowCustomBreed] = useState(false);
    const [dob, setDob] = useState('');
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [deleteProfileImg, setDeleteProfileImg] = useState(false);
    const [isNeutered, setIsNeutered] = useState<boolean>(false);
    const [hasMicrochip, setHasMicrochip] = useState<boolean>(false);
    const [registrationNumber, setRegistrationNumber] = useState('');
    const [registrationFile, setRegistrationFile] = useState<File | null>(null);
    const [existingRegistrationUrl, setExistingRegistrationUrl] = useState<string | null>(null);
    const [deleteRegistrationPdf, setDeleteRegistrationPdf] = useState(false);

    // 품종 목록
    const [breedList, setBreedList] = useState<Breed[]>([]);
    const [isLoadingBreeds, setIsLoadingBreeds] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const registrationInputRef = useRef<HTMLInputElement>(null);

    // 품종 목록 불러오기
    useEffect(() => {
        const fetchBreeds = async () => {
            if (type !== 'other') {
                setIsLoadingBreeds(true);
                try {
                    const species: Species = type === 'dog' ? 'DOG' : 'CAT';
                    const breeds = await breedApi.getBreeds(species);
                    if (Array.isArray(breeds)) {
                        setBreedList(breeds);
                    } else {
                        console.error('품종 데이터가 배열이 아닙니다:', breeds);
                    }
                } catch (error) {
                    console.error('품종 목록 조회 실패:', error);
                    setBreedList([]);
                } finally {
                    setIsLoadingBreeds(false);
                }
            } else {
                console.log('type이 other이므로 품종 조회 스킵');
                setBreedList([]);
            }
        };
        fetchBreeds();
    }, [type]);

    // 모달 열릴 때 초기화
    useEffect(() => {
        if (isOpen) {
            if (mode === 'edit' && pet) {
                setType(pet.type);
                setGender(pet.gender);
                setName(pet.name);
                setDob(pet.dob);
                setImagePreview(pet.imageUrl);
                setIsNeutered(pet.isNeutered || false);
                setHasMicrochip(pet.hasMicrochip || false);
                setRegistrationNumber(pet.registrationNum || '');
                setImageFile(null);
                setRegistrationFile(null);
                setExistingRegistrationUrl(pet.registrationUrl || null);
                setDeleteProfileImg(false);
                setDeleteRegistrationPdf(false);

                // 품종 정보 설정
                if (pet.type === 'other') {
                    setCustomBreed(pet.customBreed || pet.mainBreed || '');
                    setShowCustomBreed(true);
                    setMainBreed('');
                    setMainBreedId(undefined);
                } else if (pet.customBreed) {
                    // 커스텀 품종인 경우
                    setCustomBreed(pet.customBreed);
                    setMainBreed('직접입력');
                    setMainBreedId(undefined);
                    setShowCustomBreed(true);
                } else if (pet.mainBreedId) {
                    // DB에서 가져온 품종인 경우
                    setMainBreed(pet.mainBreed || '');
                    setMainBreedId(pet.mainBreedId);
                    setShowCustomBreed(false);
                }

                // 서브 품종
                if (pet.subBreedId) {
                    setSubBreed(pet.subBreed || '');
                    setSubBreedId(pet.subBreedId);
                } else {
                    setSubBreed('');
                    setSubBreedId(undefined);
                }
            } else {
                // 추가 모드 - 초기화
                resetForm();
            }
        }
    }, [isOpen, mode, pet]);

    const resetForm = () => {
        setType('dog');
        setGender('정보없음');
        setName('');
        setMainBreed('');
        setMainBreedId(undefined);
        setSubBreed('');
        setSubBreedId(undefined);
        setCustomBreed('');
        setShowCustomBreed(false);
        setDob('');
        setImagePreview(null);
        setImageFile(null);
        setDeleteProfileImg(false);
        setIsNeutered(false);
        setHasMicrochip(false);
        setRegistrationNumber('');
        setRegistrationFile(null);
        setExistingRegistrationUrl(null);
        setDeleteRegistrationPdf(false);
    };

    if (!isOpen) return null;

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setDeleteProfileImg(false);

            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDeleteImage = () => {
        setImagePreview(null);
        setImageFile(null);
        setDeleteProfileImg(true);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleRegistrationFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setRegistrationFile(e.target.files[0]);
            setDeleteRegistrationPdf(false);
        }
    };

    const handleDeleteRegistration = () => {
        setRegistrationFile(null);
        setExistingRegistrationUrl(null);
        setDeleteRegistrationPdf(true);
        if (registrationInputRef.current) {
            registrationInputRef.current.value = '';
        }
    };

    const handleMainBreedChange = (selectedValue: string) => {
        if (selectedValue === '직접입력') {
            setMainBreed('직접입력');
            setMainBreedId(undefined);
            setShowCustomBreed(true);
            setSubBreed('');
            setSubBreedId(undefined);
        } else if (selectedValue) {
            const selectedBreedObj = breedList.find(b => b.id === Number(selectedValue));
            if (selectedBreedObj) {
                setMainBreed(selectedBreedObj.name);
                setMainBreedId(selectedBreedObj.id);
                setShowCustomBreed(false);
                setCustomBreed('');
                setSubBreed('');
                setSubBreedId(undefined);
            }
        } else {
            setMainBreed('');
            setMainBreedId(undefined);
            setShowCustomBreed(false);
            setCustomBreed('');
            setSubBreed('');
            setSubBreedId(undefined);
        }
    };

    const handleSubBreedChange = (selectedValue: string) => {
        if (selectedValue) {
            const selectedBreedObj = breedList.find(b => b.id === Number(selectedValue));
            if (selectedBreedObj) {
                setSubBreed(selectedBreedObj.name);
                setSubBreedId(selectedBreedObj.id);
            }
        } else {
            setSubBreed('');
            setSubBreedId(undefined);
        }
    };

    const handleTypeChange = (newType: 'dog' | 'cat' | 'other') => {
        setType(newType);
        setMainBreed('');
        setMainBreedId(undefined);
        setSubBreed('');
        setSubBreedId(undefined);
        setCustomBreed('');
        setShowCustomBreed(newType === 'other');
    };

    const getAvailableSubBreeds = () => {
        if (!mainBreedId || showCustomBreed) return [];
        return breedList.filter(breed => breed.id !== mainBreedId);
    };

    const handleSave = () => {
        onSave({
            id: pet?.id,
            type,
            gender,
            name,
            mainBreed: showCustomBreed ? customBreed : mainBreed,
            mainBreedId: showCustomBreed ? undefined : mainBreedId,
            subBreed: subBreed || null,
            subBreedId: subBreedId,
            customBreed: showCustomBreed ? customBreed : null,
            dob,
            imageDataUrl: imagePreview,
            imageFile,
            deleteProfileImg,
            isNeutered,
            hasMicrochip,
            registrationNumber,
            registrationFile,
            deleteRegistrationPdf,
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
            <div className="bg-white rounded-2xl p-4 w-full max-w-lg shadow-xl animate-fade-in-scale">
                <div className="p-2 max-h-[90vh] overflow-y-auto">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">
                        {mode === 'add' ? '새 펫 등록' : '펫 정보 수정'}
                    </h2>

                    {/* 이미지 업로드 */}
                    <div className="flex flex-col items-center mb-6">
                        <div
                            className="w-40 h-40 rounded-full bg-gray-100 mb-4 overflow-hidden flex items-center justify-center cursor-pointer border-2 border-dashed border-gray-300 hover:border-indigo-400 transition"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {imagePreview ? (
                                <img src={imagePreview} alt="펫 미리보기" className="w-full h-full object-cover" />
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
                        {(imagePreview || (mode === 'edit' && pet?.imageUrl)) && (
                            <button
                                onClick={handleDeleteImage}
                                className="text-sm text-red-500 hover:text-red-600 mt-2"
                            >
                                <i className="fas fa-trash mr-1"></i>
                                기본 이미지로 변경
                            </button>
                        )}
                    </div>

                    {/* 종류 선택 */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">종류</label>
                        <div className="flex gap-2 sm:gap-4">
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

                    {/* 성별 선택 */}
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

                    {/* 입력 필드들 */}
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="petName" className="block text-sm font-medium text-gray-700 mb-1">
                                이름
                            </label>
                            <input
                                type="text"
                                id="petName"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                                placeholder="펫의 이름을 입력해주세요"
                            />
                        </div>

                        {/* 품종 선택 */}
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
                                        value={mainBreedId || ''}
                                        onChange={(e) => handleMainBreedChange(e.target.value)}
                                        disabled={isLoadingBreeds}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition appearance-none bg-white"
                                    >
                                        <option value="">
                                            {isLoadingBreeds ? '품종 불러오는 중...' : '주품종을 선택해주세요'}
                                        </option>
                                        {(() => {
                                            return Array.isArray(breedList) && breedList.map((breed) => (
                                                <option key={breed.id} value={breed.id}>
                                                    {breed.name}
                                                </option>
                                            ));
                                        })()}
                                        <option value="직접입력">직접입력</option>
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

                        {/* 서브 품종 */}
                        {type !== 'other' && mainBreedId && !showCustomBreed && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    서브품종 <span className="text-gray-500 text-xs">(선택사항, 믹스견의 경우)</span>
                                </label>
                                <select
                                    value={subBreedId || ''}
                                    onChange={(e) => handleSubBreedChange(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition appearance-none bg-white"
                                >
                                    <option value="">서브품종 선택 (선택사항)</option>
                                    {Array.isArray(breedList) && getAvailableSubBreeds().map((breed) => (
                                        <option key={breed.id} value={breed.id}>
                                            {breed.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div>
                            <label htmlFor="petDob" className="block text-sm font-medium text-gray-700 mb-1">
                                생년월일
                            </label>
                            <input
                                type="date"
                                id="petDob"
                                value={dob}
                                onChange={(e) => setDob(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                            />
                        </div>
                    </div>

                    {/* 중성화 여부 */}
                    <div className="mb-4 mt-4">
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

                    {/* 마이크로칩 여부 */}
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

                    {/* 동물등록증번호 */}
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

                    {/* 동물 등록증 첨부 */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">동물 등록증 첨부</label>
                        {/* 기존 파일 표시 */}
                        {mode === 'edit' && existingRegistrationUrl && !deleteRegistrationPdf && !registrationFile && (
                            <div className="mb-2 p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <i className="fas fa-file-pdf text-red-500"></i>
                                    <span className="text-sm text-gray-600">기존 등록증</span>
                                    <button
                                        onClick={() => window.open(existingRegistrationUrl, '_blank')}
                                        className="text-xs text-indigo-500 hover:text-indigo-600"
                                    >
                                        보기
                                    </button>
                                </div>
                                <button
                                    onClick={handleDeleteRegistration}
                                    className="text-red-500 text-sm hover:text-red-600"
                                >
                                    삭제
                                </button>
                            </div>
                        )}

                        {/* 새 파일 선택 */}
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
                                    onClick={handleDeleteRegistration}
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

                    {/* 버튼 */}
                    <div className="flex justify-end gap-4 mt-8">
                        <button
                            onClick={onClose}
                            className="py-2 px-6 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                        >
                            취소
                        </button>
                        <button
                            onClick={handleSave}
                            className="py-2 px-6 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition"
                        >
                            저장
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PetModal;