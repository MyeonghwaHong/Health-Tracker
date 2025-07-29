import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Check, X, TrendingUp, Droplets, Utensils, Weight, ChevronLeft, ChevronRight, Camera, Clock } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const HealthTrackerApp = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [healthData, setHealthData] = useState({});
  const [activeModal, setActiveModal] = useState(null);
  const [tempData, setTempData] = useState('');
  const [tempTime, setTempTime] = useState('');
  const [tempPhoto, setTempPhoto] = useState(null);

  // 초기 데이터 설정
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    if (!healthData[today]) {
      setHealthData(prev => ({
        ...prev,
        [today]: {
          water: {
            count: 8,
            targetAmount: 2000,
            records: Array(8).fill({ amount: '', completed: false, time: '' })
          },
          meals: {
            count: 4,
            labels: ['아침', '점심', '간식', '저녁'],
            records: Array(4).fill({ food: '', completed: false, time: '', photo: null })
          },
          exercise: { type: '', duration: '', completed: false },
          weight: ''
        }
      }));
    }
  }, []);

  // 날짜 포맷팅
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // 달력 렌더링을 위한 날짜 계산
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // 이전 달의 빈 날짜들
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // 현재 달의 날짜들
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  // 월 변경
  const changeMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  // 날짜 선택
  const selectDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    setSelectedDate(dateStr);
    
    // 해당 날짜의 데이터가 없으면 초기화
    if (!healthData[dateStr]) {
      setHealthData(prev => ({
        ...prev,
        [dateStr]: {
          water: {
            count: 8,
            targetAmount: 2000,
            records: Array(8).fill({ amount: '', completed: false, time: '' })
          },
          meals: {
            count: 4,
            labels: ['아침', '점심', '간식', '저녁'],
            records: Array(4).fill({ food: '', completed: false, time: '', photo: null })
          },
          exercise: { type: '', duration: '', completed: false },
          weight: ''
        }
      }));
    }
  };

  // 물 섭취 설정 업데이트
  const updateWaterSettings = (count, targetAmount) => {
    const newRecords = Array(count).fill({ amount: '', completed: false, time: '' });
    // 기존 데이터가 있으면 보존
    if (healthData[selectedDate]?.water?.records) {
      healthData[selectedDate].water.records.forEach((record, index) => {
        if (index < count) {
          newRecords[index] = record;
        }
      });
    }
    
    setHealthData(prev => ({
      ...prev,
      [selectedDate]: {
        ...prev[selectedDate],
        water: {
          count,
          targetAmount,
          records: newRecords
        }
      }
    }));
  };

  // 물 섭취 기록
  const updateWater = (index, amount) => {
    setHealthData(prev => ({
      ...prev,
      [selectedDate]: {
        ...prev[selectedDate],
        water: {
          ...prev[selectedDate].water,
          records: prev[selectedDate].water.records.map((item, i) => 
            i === index ? { ...item, amount } : item
          )
        }
      }
    }));
  };

  // 물 섭취 완료
  const toggleWaterComplete = (index) => {
    const currentTime = new Date().toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    setHealthData(prev => ({
      ...prev,
      [selectedDate]: {
        ...prev[selectedDate],
        water: {
          ...prev[selectedDate].water,
          records: prev[selectedDate].water.records.map((item, i) => 
            i === index ? { 
              ...item, 
              completed: !item.completed,
              time: !item.completed ? currentTime : ''
            } : item
          )
        }
      }
    }));
  };

  // 물 섭취 진행률 계산
  const getWaterProgress = () => {
    const waterData = currentData.water;
    if (!waterData) return { current: 0, target: 2000, percentage: 0 };
    
    const current = waterData.records
      .filter(record => record.completed && record.amount)
      .reduce((sum, record) => {
        const amount = parseFloat(record.amount.replace(/[^0-9.]/g, '')) || 0;
        return sum + amount;
      }, 0);
    
    const percentage = Math.min((current / waterData.targetAmount) * 100, 100);
    
    return {
      current: Math.round(current),
      target: waterData.targetAmount,
      percentage: Math.round(percentage)
    };
  };

  // 식사 설정 업데이트
  const updateMealSettings = (count, labels) => {
    const newRecords = Array(count).fill({ food: '', completed: false, time: '', photo: null });
    // 기존 데이터가 있으면 보존
    if (healthData[selectedDate]?.meals?.records) {
      healthData[selectedDate].meals.records.forEach((record, index) => {
        if (index < count) {
          newRecords[index] = record;
        }
      });
    }
    
    setHealthData(prev => ({
      ...prev,
      [selectedDate]: {
        ...prev[selectedDate],
        meals: {
          count,
          labels: labels.slice(0, count),
          records: newRecords
        }
      }
    }));
  };

  // 식사 기록
  const updateMeal = (index, food, time, photo) => {
    setHealthData(prev => ({
      ...prev,
      [selectedDate]: {
        ...prev[selectedDate],
        meals: {
          ...prev[selectedDate].meals,
          records: prev[selectedDate].meals.records.map((item, i) => 
            i === index ? { ...item, food, time: time || item.time, photo: photo !== undefined ? photo : item.photo } : item
          )
        }
      }
    }));
  };

  // 식사 완료
  const toggleMealComplete = (index) => {
    setHealthData(prev => ({
      ...prev,
      [selectedDate]: {
        ...prev[selectedDate],
        meals: {
          ...prev[selectedDate].meals,
          records: prev[selectedDate].meals.records.map((item, i) => 
            i === index ? { 
              ...item, 
              completed: !item.completed
            } : item
          )
        }
      }
    }));
  };

  // 사진 업로드 핸들러
  const handlePhotoUpload = (file, mealIndex) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        updateMeal(mealIndex, undefined, undefined, e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // 체중 기록
  const updateWeight = (weight) => {
    setHealthData(prev => ({
      ...prev,
      [selectedDate]: {
        ...prev[selectedDate],
        weight
      }
    }));
  };

  // 운동 기록
  const updateExercise = (type, duration) => {
    setHealthData(prev => ({
      ...prev,
      [selectedDate]: {
        ...prev[selectedDate],
        exercise: { type, duration, completed: true }
      }
    }));
  };

  // 체중 차트 데이터 생성
  const getWeightChartData = () => {
    return Object.entries(healthData)
      .filter(([date, data]) => data.weight)
      .map(([date, data]) => ({
        date: new Date(date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
        weight: parseFloat(data.weight)
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  // 모달 핸들러
  const openModal = (type, index = null) => {
    setActiveModal({ type, index });
    if (type === 'waterSettings') {
      const waterData = currentData.water;
      setTempData(`${waterData.count},${waterData.targetAmount}`);
    } else if (type === 'mealSettings') {
      const mealData = currentData.meals;
      setTempData(`${mealData.count},${mealData.labels.join(',')}`);
    } else if (type === 'meal' && index !== null) {
      const meal = currentData.meals.records[index];
      setTempData(meal.food || '');
      setTempTime(meal.time || '');
      setTempPhoto(meal.photo || null);
    } else {
      setTempData('');
      setTempTime('');
      setTempPhoto(null);
    }
  };

  const closeModal = () => {
    setActiveModal(null);
    setTempData('');
    setTempTime('');
    setTempPhoto(null);
  };

  const saveModalData = () => {
    const { type, index } = activeModal;
    
    switch (type) {
      case 'water':
        updateWater(index, tempData);
        break;
      case 'waterSettings':
        const [count, targetAmount] = tempData.split(',');
        updateWaterSettings(parseInt(count) || 8, parseInt(targetAmount) || 2000);
        break;
      case 'meal':
        updateMeal(index, tempData, tempTime, tempPhoto);
        break;
      case 'mealSettings':
        const parts = tempData.split(',');
        const mealCount = parseInt(parts[0]) || 4;
        const labels = parts.slice(1);
        updateMealSettings(mealCount, labels);
        break;
      case 'weight':
        updateWeight(tempData);
        break;
      case 'exercise':
        const [exerciseType, duration] = tempData.split(',');
        updateExercise(exerciseType?.trim() || '', duration?.trim() || '');
        break;
    }
    
    closeModal();
  };

  const currentData = healthData[selectedDate] || {
    water: {
      count: 8,
      targetAmount: 2000,
      records: Array(8).fill({ amount: '', completed: false, time: '' })
    },
    meals: {
      count: 4,
      labels: ['아침', '점심', '간식', '저녁'],
      records: Array(4).fill({ food: '', completed: false, time: '', photo: null })
    },
    exercise: { type: '', duration: '', completed: false },
    weight: ''
  };

  const days = getDaysInMonth(currentDate);
  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      {/* 헤더 */}
      <div className="bg-blue-600 text-white p-4">
        <h1 className="text-xl font-bold text-center">건강관리</h1>
      </div>

      {/* 달력 */}
      <div className="p-4 bg-gray-50">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => changeMonth(-1)} className="p-2">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold">
              {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
            </h2>
            <button onClick={() => changeMonth(1)} className="p-2">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 p-2">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => (
              <button
                key={index}
                onClick={() => day && selectDate(day)}
                className={`p-2 text-sm rounded ${
                  day
                    ? day.toISOString().split('T')[0] === selectedDate
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-gray-100'
                    : ''
                }`}
                disabled={!day}
              >
                {day ? day.getDate() : ''}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 선택된 날짜 */}
      <div className="px-4 py-2 bg-gray-100">
        <p className="text-sm text-gray-600">{formatDate(selectedDate)}</p>
      </div>

      {/* 대시보드 */}
      <div className="p-4 space-y-4">
        {/* 물 섭취 */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <Droplets className="w-5 h-5 text-blue-500 mr-2" />
              <h3 className="font-semibold">물 섭취</h3>
            </div>
            <button
              onClick={() => openModal('waterSettings')}
              className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
            >
              설정
            </button>
          </div>
          
          <div className={`grid gap-2 mb-4`} style={{ gridTemplateColumns: `repeat(${Math.min(currentData.water.count, 5)}, 1fr)` }}>
            {currentData.water.records.map((water, index) => (
              <div key={index} className="text-center">
                <button
                  onClick={() => openModal('water', index)}
                  className={`w-full p-2 text-xs border rounded mb-1 ${
                    water.completed 
                      ? 'bg-blue-100 text-blue-600 opacity-60' 
                      : 'border-gray-300 hover:border-blue-300'
                  }`}
                >
                  {water.amount || `${index + 1}번`}
                </button>
                {water.amount && (
                  <button
                    onClick={() => toggleWaterComplete(index)}
                    className={`w-full text-xs p-1 rounded ${
                      water.completed 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {water.completed ? `완료 ${water.time}` : '완료'}
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* 물 섭취 진행률 */}
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">진행률</span>
              <span className="text-sm font-medium">
                {getWaterProgress().current}ml / {getWaterProgress().target}ml ({getWaterProgress().percentage}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${getWaterProgress().percentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* 식사 */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <Utensils className="w-5 h-5 text-orange-500 mr-2" />
              <h3 className="font-semibold">식사</h3>
            </div>
            <button
              onClick={() => openModal('mealSettings')}
              className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
            >
              설정
            </button>
          </div>
          <div className={`grid gap-3`} style={{ gridTemplateColumns: `repeat(${Math.min(currentData.meals.count, 4)}, 1fr)` }}>
            {currentData.meals.records.map((meal, index) => (
              <div key={index} className="text-center">
                <div className="mb-2">
                  <span className="text-xs text-gray-500 font-medium">
                    {currentData.meals.labels[index] || `${index + 1}끼`}
                  </span>
                </div>
                
                {meal.photo && (
                  <div className="mb-2">
                    <img 
                      src={meal.photo} 
                      alt="식사 사진"
                      className="w-full h-16 object-cover rounded border"
                    />
                  </div>
                )}
                
                <button
                  onClick={() => openModal('meal', index)}
                  className={`w-full p-2 text-xs border rounded mb-1 ${
                    meal.completed 
                      ? 'bg-orange-100 text-orange-600 opacity-60' 
                      : 'border-gray-300 hover:border-orange-300'
                  }`}
                >
                  {meal.food || '메뉴 입력'}
                </button>
                
                {meal.time && (
                  <div className="text-xs text-gray-500 mb-1">
                    {meal.time}
                  </div>
                )}
                
                {meal.food && (
                  <button
                    onClick={() => toggleMealComplete(index)}
                    className={`w-full text-xs p-1 rounded ${
                      meal.completed 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {meal.completed ? '완료' : '완료'}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 운동 */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <TrendingUp className="w-5 h-5 text-green-500 mr-2" />
              <h3 className="font-semibold">운동</h3>
            </div>
            <button
              onClick={() => openModal('exercise')}
              className="p-1 text-blue-500 hover:bg-blue-50 rounded"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="text-sm text-gray-600">
            {currentData.exercise.type ? (
              <p>{currentData.exercise.type} - {currentData.exercise.duration}</p>
            ) : (
              <p>운동 기록이 없습니다</p>
            )}
          </div>
        </div>

        {/* 공복 체중 */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <Weight className="w-5 h-5 text-purple-500 mr-2" />
              <h3 className="font-semibold">공복 체중</h3>
            </div>
            <button
              onClick={() => openModal('weight')}
              className="p-1 text-blue-500 hover:bg-blue-50 rounded"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          
          <div className="mb-3">
            <p className="text-sm text-gray-600">
              오늘: {currentData.weight ? `${currentData.weight}kg` : '기록 없음'}
            </p>
          </div>

          {getWeightChartData().length > 0 && (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={getWeightChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="weight" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* 모달 */}
      {activeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4">
              {activeModal.type === 'water' && `물 섭취 ${activeModal.index + 1}번`}
              {activeModal.type === 'waterSettings' && '물 섭취 설정'}
              {activeModal.type === 'meal' && `${currentData.meals.labels[activeModal.index] || '식사'} 기록`}
              {activeModal.type === 'mealSettings' && '식사 설정'}
              {activeModal.type === 'weight' && '공복 체중'}
              {activeModal.type === 'exercise' && '운동'}
            </h3>
            
            {activeModal.type === 'waterSettings' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    물 섭취 횟수
                  </label>
                  <input
                    type="number"
                    value={tempData.split(',')[0] || ''}
                    onChange={(e) => setTempData(`${e.target.value},${tempData.split(',')[1] || '2000'}`)}
                    min="1"
                    max="20"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    목표 총량 (ml)
                  </label>
                  <input
                    type="number"
                    value={tempData.split(',')[1] || ''}
                    onChange={(e) => setTempData(`${tempData.split(',')[0] || '8'},${e.target.value}`)}
                    min="500"
                    max="5000"
                    step="100"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            ) : activeModal.type === 'mealSettings' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    식사 횟수
                  </label>
                  <input
                    type="number"
                    value={tempData.split(',')[0] || ''}
                    onChange={(e) => {
                      const count = parseInt(e.target.value) || 4;
                      const defaultLabels = ['아침', '점심', '간식', '저녁', '야식', '간식2'];
                      const labels = defaultLabels.slice(0, count);
                      setTempData(`${count},${labels.join(',')}`);
                    }}
                    min="1"
                    max="8"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    식사 이름 (쉼표로 구분)
                  </label>
                  <input
                    type="text"
                    value={tempData.split(',').slice(1).join(',') || ''}
                    onChange={(e) => setTempData(`${tempData.split(',')[0] || '4'},${e.target.value}`)}
                    placeholder="아침,점심,간식,저녁"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            ) : activeModal.type === 'meal' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    음식
                  </label>
                  <input
                    type="text"
                    value={tempData}
                    onChange={(e) => setTempData(e.target.value)}
                    placeholder="음식 종류 (예: 샐러드, 파스타)"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Clock className="w-4 h-4 inline mr-1" />
                    시간
                  </label>
                  <input
                    type="time"
                    value={tempTime}
                    onChange={(e) => setTempTime(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Camera className="w-4 h-4 inline mr-1" />
                    사진
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          setTempPhoto(event.target.result);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                  {tempPhoto && (
                    <div className="mt-2">
                      <img 
                        src={tempPhoto} 
                        alt="미리보기" 
                        className="w-full h-32 object-cover rounded border"
                      />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <input
                type="text"
                value={tempData}
                onChange={(e) => setTempData(e.target.value)}
                placeholder={
                  activeModal.type === 'water' ? '물의 양 (예: 500ml)' :
                  activeModal.type === 'weight' ? '체중 (예: 70.5)' :
                  '운동 종류, 시간 (예: 런닝, 30분)'
                }
                className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:border-blue-500"
                autoFocus
              />
            )}
            
            <div className="flex space-x-3">
              <button
                onClick={closeModal}
                className="flex-1 p-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                취소
              </button>
              <button
                onClick={saveModalData}
                className="flex-1 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                완료
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthTrackerApp;