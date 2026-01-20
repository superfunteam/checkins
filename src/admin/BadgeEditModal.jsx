import { useState, useEffect, useRef } from 'react';
import FileUploadInput from './FileUploadInput';
import EmojiPicker from './EmojiPicker';
import { uploadFile } from './adminApi';

export default function BadgeEditModal({
  badge,
  isNew,
  badgeTypes,
  allBadges,
  passportId,
  onSave,
  onClose,
}) {
  const [formData, setFormData] = useState({
    id: '',
    type: badgeTypes[0]?.id || 'milestone',
    name: '',
    time: '',
    startTime: '',
    order: 1,
    shortDesc: '',
    longDesc: '',
    instruction: '',
    image: '',
    emoji: '',
    sound: '',
    unlockHint: '',
    unlockCondition: { type: 'all', badgeIds: [] },
  });

  const [visualType, setVisualType] = useState('image'); // 'image' or 'emoji'
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiButtonRef = useRef(null);
  const [imageFile, setImageFile] = useState(null);
  const [soundFile, setSoundFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Initialize form with badge data
  useEffect(() => {
    if (badge && !isNew) {
      setFormData({
        id: badge.id || '',
        type: badge.type || badgeTypes[0]?.id || 'milestone',
        name: badge.name || '',
        time: badge.time || '',
        startTime: badge.startTime || '',
        order: badge.order || 1,
        shortDesc: badge.shortDesc || '',
        longDesc: badge.longDesc || '',
        instruction: badge.instruction || '',
        image: badge.image || '',
        emoji: badge.emoji || '',
        sound: badge.sound || '',
        unlockHint: badge.unlockHint || '',
        unlockCondition: badge.unlockCondition || { type: 'all', badgeIds: [] },
      });
      // Set visual type based on what the badge has
      setVisualType(badge.emoji ? 'emoji' : 'image');
    } else if (isNew) {
      // Set order to be after the last badge
      const maxOrder = Math.max(0, ...allBadges.map(b => b.order || 0));
      setFormData(prev => ({ ...prev, order: maxOrder + 1 }));
      setVisualType('emoji'); // Default new badges to emoji
    }
  }, [badge, isNew, badgeTypes, allBadges]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleUnlockBadgeToggle = (badgeId) => {
    setFormData(prev => {
      const currentIds = prev.unlockCondition?.badgeIds || [];
      const newIds = currentIds.includes(badgeId)
        ? currentIds.filter(id => id !== badgeId)
        : [...currentIds, badgeId];
      return {
        ...prev,
        unlockCondition: { ...prev.unlockCondition, type: 'all', badgeIds: newIds },
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      let finalImagePath = formData.image;
      let finalSoundPath = formData.sound;

      // Upload image if a new file was selected (only if using image mode)
      if (visualType === 'image' && imageFile) {
        const ext = imageFile.name.split('.').pop();
        const filename = `badge-${formData.id}.${ext}`;
        const result = await uploadFile(passportId, imageFile, 'images', filename);
        finalImagePath = result.path;
      }

      // Upload sound if a new file was selected
      if (soundFile) {
        const ext = soundFile.name.split('.').pop();
        const filename = `badge-${formData.id}.${ext}`;
        const result = await uploadFile(passportId, soundFile, 'audio', filename);
        finalSoundPath = result.path;
      }

      // Build the badge object
      const badgeData = {
        id: formData.id,
        type: formData.type,
        name: formData.name,
        shortDesc: formData.shortDesc,
        longDesc: formData.longDesc,
        instruction: formData.instruction,
        order: parseInt(formData.order, 10) || 1,
      };

      // Add image OR emoji based on visual type
      if (visualType === 'emoji') {
        badgeData.emoji = formData.emoji;
      } else {
        badgeData.image = finalImagePath;
      }

      // Add optional fields
      if (formData.time) {
        badgeData.time = formData.time;
      }
      if (formData.startTime) {
        badgeData.startTime = formData.startTime;
      }
      if (finalSoundPath) {
        badgeData.sound = finalSoundPath;
      }

      // Add secret badge fields
      if (formData.type === 'secret') {
        if (formData.unlockHint) {
          badgeData.unlockHint = formData.unlockHint;
        }
        if (formData.unlockCondition?.badgeIds?.length > 0) {
          badgeData.unlockCondition = formData.unlockCondition;
        }
      }

      await onSave(badgeData);
    } catch (err) {
      console.error('Save error:', err);
      setError(err.message);
      setSaving(false);
    }
  };

  const isSecretBadge = formData.type === 'secret';

  // Get available badges for unlock condition (exclude self and other secret badges)
  const availableBadgesForUnlock = allBadges.filter(
    b => b.id !== formData.id && b.type !== 'secret'
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {isNew ? 'Add New Badge' : `Edit Badge: ${badge?.name}`}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Identity Section */}
          <section>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Identity
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.id}
                  onChange={(e) => handleChange('id', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                  disabled={!isNew}
                  required
                  placeholder="badge-id"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
                />
                {isNew && (
                  <p className="text-xs text-gray-400 mt-1">Lowercase, hyphens only</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleChange('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {badgeTypes.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  required
                  placeholder="Badge Name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </section>

          {/* Timing Section */}
          <section>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Timing
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time
                </label>
                <input
                  type="text"
                  value={formData.time}
                  onChange={(e) => handleChange('time', e.target.value)}
                  placeholder="9:00 AM"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time
                </label>
                <input
                  type="text"
                  value={formData.startTime}
                  onChange={(e) => handleChange('startTime', e.target.value)}
                  placeholder="Optional"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-400 mt-1">For schedule display</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Order <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => handleChange('order', e.target.value)}
                  required
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </section>

          {/* Content Section */}
          <section>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Content
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Short Description <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.shortDesc}
                  onChange={(e) => handleChange('shortDesc', e.target.value)}
                  required
                  placeholder="Brief description shown on badge card"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Long Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.longDesc}
                  onChange={(e) => handleChange('longDesc', e.target.value)}
                  required
                  rows={3}
                  placeholder="Full description shown in badge modal"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Instruction <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.instruction}
                  onChange={(e) => handleChange('instruction', e.target.value)}
                  required
                  rows={2}
                  placeholder="How to claim this badge"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
            </div>
          </section>

          {/* Media Section */}
          <section>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Badge Visual
            </h3>

            {/* Image vs Emoji toggle */}
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => setVisualType('emoji')}
                className={`flex-1 py-2 px-4 rounded-lg border-2 transition-colors ${
                  visualType === 'emoji'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                Emoji
              </button>
              <button
                type="button"
                onClick={() => setVisualType('image')}
                className={`flex-1 py-2 px-4 rounded-lg border-2 transition-colors ${
                  visualType === 'image'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                Image
              </button>
            </div>

            {visualType === 'emoji' ? (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Badge Emoji <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <button
                    ref={emojiButtonRef}
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="w-24 h-24 flex items-center justify-center text-5xl border-2 border-dashed border-gray-300 rounded-full hover:border-gray-400 transition-colors"
                  >
                    {formData.emoji || '+'}
                  </button>
                  {showEmojiPicker && (
                    <div className="absolute top-full left-0 mt-2 z-10">
                      <EmojiPicker
                        value={formData.emoji}
                        onChange={(emoji) => handleChange('emoji', emoji)}
                        onClose={() => setShowEmojiPicker(false)}
                      />
                    </div>
                  )}
                </div>
                {!formData.emoji && (
                  <p className="text-xs text-gray-400">Click to select an emoji</p>
                )}
              </div>
            ) : (
              <FileUploadInput
                label="Badge Image"
                accept="image/*"
                type="image"
                value={formData.image}
                previewUrl={formData.image ? `/passports/${passportId}/${formData.image}` : null}
                onChange={setImageFile}
                onClear={() => {
                  setImageFile(null);
                  handleChange('image', '');
                }}
                required
              />
            )}
          </section>

          {/* Sound Section */}
          <section>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Sound (Optional)
            </h3>
            <FileUploadInput
              label="Badge Sound"
              accept="audio/*"
              type="audio"
              value={formData.sound}
              previewUrl={formData.sound ? `/passports/${passportId}/${formData.sound}` : null}
              onChange={setSoundFile}
              onClear={() => {
                setSoundFile(null);
                handleChange('sound', '');
              }}
            />
          </section>

          {/* Secret Badge Section */}
          {isSecretBadge && (
            <section>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Secret Badge Settings
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unlock Hint
                  </label>
                  <input
                    type="text"
                    value={formData.unlockHint}
                    onChange={(e) => handleChange('unlockHint', e.target.value)}
                    placeholder="Hint shown before badge is unlocked"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Required Badges to Unlock
                  </label>
                  <p className="text-xs text-gray-500 mb-3">
                    Select the badges that must be completed to unlock this secret badge.
                  </p>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 bg-gray-50 rounded-lg">
                    {availableBadgesForUnlock.map(b => {
                      const isSelected = formData.unlockCondition?.badgeIds?.includes(b.id);
                      const badgeType = badgeTypes.find(t => t.id === b.type);
                      return (
                        <label
                          key={b.id}
                          className={`
                            flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors
                            ${isSelected ? 'bg-blue-100' : 'hover:bg-gray-100'}
                          `}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleUnlockBadgeToggle(b.id)}
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: badgeType?.color || '#ccc' }}
                          />
                          <span className="text-sm truncate">
                            {b.name}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>
          )}
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="badge-form"
            disabled={saving}
            onClick={handleSubmit}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              'Save Badge'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
