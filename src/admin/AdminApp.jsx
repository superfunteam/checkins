import { useState, useEffect } from 'react';
import { Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
import { loadPassportIndex, loadPassport } from '../utils/passportLoader';
import BadgeEditModal from './BadgeEditModal';
import { savePassport } from './adminApi';
import {
  TAILWIND_COLORS,
  BACKGROUND_PRESETS,
  COLOR_NAMES,
  getColorPalette,
  getHighlightColor,
  getDangerColors,
  detectColorName,
  detectBackgroundPreset,
  formatColorName
} from './colorPalettes';

function PassportList() {
  const [index, setIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPassportIndex()
      .then(setIndex)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-600">
        Failed to load passports: {error.message}
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Passports</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {index.passports.map((passport) => (
          <Link
            key={passport.id}
            to={`/admin/${passport.id}`}
            className="block p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-200"
          >
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold">{passport.name}</h2>
              <span
                className={`px-2 py-1 text-xs rounded-full ${
                  passport.enabled
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {passport.enabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <p className="text-sm text-gray-500">/{passport.id}</p>
            {passport.default && (
              <span className="inline-block mt-2 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                Default
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}

function PassportDetail() {
  const { passportId } = useParams();
  const navigate = useNavigate();
  const [passport, setPassport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingBadge, setEditingBadge] = useState(null); // null | badge | 'new'
  const [editingBadgeType, setEditingBadgeType] = useState(null); // null | index | 'new'
  const [badgeTypeForm, setBadgeTypeForm] = useState({ name: '', label: '', color: '#3B82F6', hidden: false });
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadPassport(passportId)
      .then(setPassport)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [passportId]);

  const handleSaveBadge = async (badgeData) => {
    const isNew = editingBadge === 'new';
    let updatedBadges;

    if (isNew) {
      updatedBadges = [...passport.badges, badgeData];
    } else {
      updatedBadges = passport.badges.map(b =>
        b.id === badgeData.id ? badgeData : b
      );
    }

    const updatedPassport = { ...passport, badges: updatedBadges };

    await savePassport(passportId, updatedPassport);
    setPassport(updatedPassport);
    setEditingBadge(null);
    setRefreshKey(k => k + 1);
  };

  const handleSettingChange = async (key, value) => {
    const updatedSettings = { ...passport.settings, [key]: value };
    const updatedPassport = { ...passport, settings: updatedSettings };

    await savePassport(passportId, updatedPassport);
    setPassport(updatedPassport);
    setRefreshKey(k => k + 1);
  };

  const handleThemeColorChange = async (colorType, colorName) => {
    const currentColors = passport.theme?.colors || {};
    let updatedColors = { ...currentColors };

    if (colorType === 'primary') {
      updatedColors.primary = getColorPalette(colorName);
    } else if (colorType === 'secondary') {
      updatedColors.accent = getColorPalette(colorName);
    } else if (colorType === 'highlight') {
      updatedColors.highlight = getHighlightColor(colorName);
    } else if (colorType === 'background') {
      const preset = BACKGROUND_PRESETS[colorName];
      if (preset) {
        updatedColors.background = preset.background;
        updatedColors.text = preset.text;
      }
    }

    // Ensure danger colors are always set
    updatedColors.danger = getDangerColors();

    const updatedTheme = { ...passport.theme, colors: updatedColors };
    const updatedPassport = { ...passport, theme: updatedTheme };

    await savePassport(passportId, updatedPassport);
    setPassport(updatedPassport);
    setRefreshKey(k => k + 1);
  };

  const startEditingBadgeType = (index) => {
    const type = passport.badgeTypes[index];
    setBadgeTypeForm({
      name: type.name || '',
      label: type.label || '',
      color: type.color || '#3B82F6',
      hidden: type.hidden || false
    });
    setEditingBadgeType(index);
  };

  const startAddingBadgeType = () => {
    setBadgeTypeForm({ name: '', label: '', color: '#3B82F6', hidden: false });
    setEditingBadgeType('new');
  };

  const cancelBadgeTypeEdit = () => {
    setEditingBadgeType(null);
    setBadgeTypeForm({ name: '', label: '', color: '#3B82F6', hidden: false });
  };

  const saveBadgeType = async () => {
    if (!badgeTypeForm.name.trim()) return;

    let updatedBadgeTypes;
    if (editingBadgeType === 'new') {
      const id = badgeTypeForm.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
      updatedBadgeTypes = [
        ...passport.badgeTypes,
        {
          id,
          name: badgeTypeForm.name,
          label: badgeTypeForm.label || badgeTypeForm.name,
          color: badgeTypeForm.color,
          hidden: badgeTypeForm.hidden
        }
      ];
    } else {
      updatedBadgeTypes = passport.badgeTypes.map((type, i) =>
        i === editingBadgeType
          ? {
              ...type,
              name: badgeTypeForm.name,
              label: badgeTypeForm.label || badgeTypeForm.name,
              color: badgeTypeForm.color,
              hidden: badgeTypeForm.hidden
            }
          : type
      );
    }

    const updatedPassport = { ...passport, badgeTypes: updatedBadgeTypes };
    await savePassport(passportId, updatedPassport);
    setPassport(updatedPassport);
    cancelBadgeTypeEdit();
    setRefreshKey(k => k + 1);
  };

  const deleteBadgeType = async (index) => {
    const type = passport.badgeTypes[index];
    const badgesUsingType = passport.badges.filter(b => b.type === type.id);

    if (badgesUsingType.length > 0) {
      alert(`Cannot delete "${type.name}" - ${badgesUsingType.length} badge(s) are using this type.`);
      return;
    }

    if (!confirm(`Delete badge type "${type.name}"?`)) return;

    const updatedBadgeTypes = passport.badgeTypes.filter((_, i) => i !== index);
    const updatedPassport = { ...passport, badgeTypes: updatedBadgeTypes };
    await savePassport(passportId, updatedPassport);
    setPassport(updatedPassport);
    setRefreshKey(k => k + 1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600 mb-4">Failed to load passport: {error.message}</p>
        <button
          onClick={() => navigate('/admin')}
          className="text-blue-600 hover:underline"
        >
          Back to list
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex gap-6">
        {/* Editor Section (2/3) */}
        <div className="w-2/3">
          <button
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Passports
          </button>

          <h1 className="text-3xl font-bold mb-2">{passport.meta.name}</h1>
          <p className="text-gray-500 mb-8">{passport.meta.description}</p>

          {/* Features */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Features</h2>
            <div className="flex flex-wrap gap-2">
              {Object.entries(passport.features).map(([feature, enabled]) => (
                <span
                  key={feature}
                  className={`px-3 py-1 rounded-full text-sm ${
                    enabled
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-500 line-through'
                  }`}
                >
                  {feature}
                </span>
              ))}
            </div>
          </section>

          {/* Settings */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Settings</h2>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <label htmlFor="badgeShape" className="font-medium">Badge Shape</label>
                  <p className="text-sm text-gray-500">Choose the shape style for badges in the grid</p>
                </div>
                <select
                  id="badgeShape"
                  value={passport.settings?.badgeShape || 'arch'}
                  onChange={(e) => handleSettingChange('badgeShape', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="arch">Arch (rounded top)</option>
                  <option value="circle">Circle</option>
                  <option value="square">Square (app icon)</option>
                  <option value="shuffle">Shuffle (mixed + tilted)</option>
                </select>
              </div>
            </div>
          </section>

          {/* Theme Colors */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Theme Colors</h2>
            <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
              {/* Primary Color */}
              <div className="flex items-center justify-between">
                <div>
                  <label htmlFor="primaryColor" className="font-medium">Primary Color</label>
                  <p className="text-sm text-gray-500">Main accent color for buttons and UI elements</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex gap-0.5">
                    {[200, 400, 500, 600, 800].map(shade => (
                      <div
                        key={shade}
                        className="w-5 h-5 first:rounded-l last:rounded-r"
                        style={{ backgroundColor: passport.theme?.colors?.primary?.[shade] || '#ccc' }}
                      />
                    ))}
                  </div>
                  <select
                    id="primaryColor"
                    value={detectColorName(passport.theme?.colors?.primary) || 'blue'}
                    onChange={(e) => handleThemeColorChange('primary', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {COLOR_NAMES.map(name => (
                      <option key={name} value={name}>{formatColorName(name)}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Secondary Color */}
              <div className="flex items-center justify-between">
                <div>
                  <label htmlFor="secondaryColor" className="font-medium">Secondary Color</label>
                  <p className="text-sm text-gray-500">Complementary color for accents and highlights</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex gap-0.5">
                    {[200, 400, 500, 600, 800].map(shade => (
                      <div
                        key={shade}
                        className="w-5 h-5 first:rounded-l last:rounded-r"
                        style={{ backgroundColor: passport.theme?.colors?.accent?.[shade] || '#ccc' }}
                      />
                    ))}
                  </div>
                  <select
                    id="secondaryColor"
                    value={detectColorName(passport.theme?.colors?.accent) || 'orange'}
                    onChange={(e) => handleThemeColorChange('secondary', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {COLOR_NAMES.map(name => (
                      <option key={name} value={name}>{formatColorName(name)}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Highlight Color */}
              <div className="flex items-center justify-between">
                <div>
                  <label htmlFor="highlightColor" className="font-medium">Highlight Color</label>
                  <p className="text-sm text-gray-500">Single color for special emphasis</p>
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className="w-5 h-5 rounded"
                    style={{ backgroundColor: passport.theme?.colors?.highlight || '#8b5cf6' }}
                  />
                  <select
                    id="highlightColor"
                    value={(() => {
                      const highlight = passport.theme?.colors?.highlight;
                      if (!highlight) return 'violet';
                      for (const [name, colors] of Object.entries(TAILWIND_COLORS)) {
                        if (colors[500].toLowerCase() === highlight.toLowerCase()) return name;
                      }
                      return 'violet';
                    })()}
                    onChange={(e) => handleThemeColorChange('highlight', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {COLOR_NAMES.map(name => (
                      <option key={name} value={name}>{formatColorName(name)}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Background Preset */}
              <div className="flex items-center justify-between">
                <div>
                  <label htmlFor="backgroundPreset" className="font-medium">Background</label>
                  <p className="text-sm text-gray-500">Background style with matching text colors</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex gap-0.5">
                    {[50, 100, 200, 300, 400].map(shade => (
                      <div
                        key={shade}
                        className="w-5 h-5 first:rounded-l last:rounded-r"
                        style={{ backgroundColor: passport.theme?.colors?.background?.[shade] || '#f8fafc' }}
                      />
                    ))}
                  </div>
                  <select
                    id="backgroundPreset"
                    value={detectBackgroundPreset(passport.theme?.colors?.background, passport.theme?.colors?.text) || 'white'}
                    onChange={(e) => handleThemeColorChange('background', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.entries(BACKGROUND_PRESETS).map(([key, preset]) => (
                      <option key={key} value={key}>{preset.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* Badge Types */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Badge Types</h2>
              <button
                onClick={startAddingBadgeType}
                className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Type
              </button>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
              {passport.badgeTypes.map((type, index) => (
                <div key={type.id}>
                  {editingBadgeType === index ? (
                    <div className="p-4 bg-blue-50">
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={badgeTypeForm.color}
                          onChange={(e) => setBadgeTypeForm(f => ({ ...f, color: e.target.value }))}
                          className="w-10 h-10 rounded cursor-pointer border-0"
                        />
                        <div className="flex-1 grid grid-cols-2 gap-3">
                          <input
                            type="text"
                            value={badgeTypeForm.name}
                            onChange={(e) => setBadgeTypeForm(f => ({ ...f, name: e.target.value }))}
                            placeholder="Name (e.g. Milestones)"
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <input
                            type="text"
                            value={badgeTypeForm.label}
                            onChange={(e) => setBadgeTypeForm(f => ({ ...f, label: e.target.value }))}
                            placeholder="Label (e.g. Milestone)"
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <label className="flex items-center gap-2 text-sm text-gray-600">
                          <input
                            type="checkbox"
                            checked={badgeTypeForm.hidden}
                            onChange={(e) => setBadgeTypeForm(f => ({ ...f, hidden: e.target.checked }))}
                            className="w-4 h-4 rounded border-gray-300 text-blue-600"
                          />
                          Hidden
                        </label>
                        <div className="flex gap-2">
                          <button
                            onClick={saveBadgeType}
                            className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelBadgeTypeEdit}
                            className="px-3 py-1.5 text-gray-600 text-sm hover:text-gray-800"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 flex items-center justify-between hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-6 h-6 rounded-full"
                          style={{ backgroundColor: type.color }}
                        />
                        <span className="font-medium">{type.name}</span>
                        <span className="text-sm text-gray-400">({type.label})</span>
                        {type.hidden && (
                          <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-500 rounded">hidden</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => startEditingBadgeType(index)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => deleteBadgeType(index)}
                          className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {editingBadgeType === 'new' && (
                <div className="p-4 bg-green-50">
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={badgeTypeForm.color}
                      onChange={(e) => setBadgeTypeForm(f => ({ ...f, color: e.target.value }))}
                      className="w-10 h-10 rounded cursor-pointer border-0"
                    />
                    <div className="flex-1 grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={badgeTypeForm.name}
                        onChange={(e) => setBadgeTypeForm(f => ({ ...f, name: e.target.value }))}
                        placeholder="Name (e.g. Milestones)"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        autoFocus
                      />
                      <input
                        type="text"
                        value={badgeTypeForm.label}
                        onChange={(e) => setBadgeTypeForm(f => ({ ...f, label: e.target.value }))}
                        placeholder="Label (e.g. Milestone)"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <label className="flex items-center gap-2 text-sm text-gray-600">
                      <input
                        type="checkbox"
                        checked={badgeTypeForm.hidden}
                        onChange={(e) => setBadgeTypeForm(f => ({ ...f, hidden: e.target.checked }))}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600"
                      />
                      Hidden
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={saveBadgeType}
                        className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                      >
                        Add
                      </button>
                      <button
                        onClick={cancelBadgeTypeEdit}
                        className="px-3 py-1.5 text-gray-600 text-sm hover:text-gray-800"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {passport.badgeTypes.length === 0 && editingBadgeType !== 'new' && (
                <div className="p-8 text-center text-gray-400">
                  No badge types yet. Click "Add Type" to create one.
                </div>
              )}
            </div>
          </section>

          {/* Badges Gallery */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Badges ({passport.badges.length})</h2>
              <button
                onClick={() => setEditingBadge('new')}
                className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Badge
              </button>
            </div>
            <div className="grid grid-cols-4 md:grid-cols-5 gap-4">
              {passport.badges.map((badge, index) => {
                const badgeType = passport.badgeTypes.find(t => t.id === badge.type);
                const shape = passport.settings?.badgeShape || 'arch';
                const SHUFFLE_SHAPES = ['arch', 'circle', 'square'];
                const effectiveShape = shape === 'shuffle'
                  ? SHUFFLE_SHAPES[index % SHUFFLE_SHAPES.length]
                  : shape;
                const borderRadius = {
                  arch: '50% 50% 24% 24%',
                  circle: '50%',
                  square: '22%'
                }[effectiveShape] || '50%';
                return (
                  <button
                    key={badge.id}
                    onClick={() => setEditingBadge(badge)}
                    className="text-center group"
                  >
                    <div
                      className="w-16 h-16 mx-auto overflow-hidden mb-2 shadow-sm transition-transform group-hover:scale-110 flex items-center justify-center"
                      style={{
                        borderWidth: '3px',
                        borderStyle: 'solid',
                        borderColor: badgeType?.color || '#ccc',
                        borderRadius,
                      }}
                    >
                      {badge.emoji ? (
                        <span className="text-3xl">{badge.emoji}</span>
                      ) : (
                        <img
                          src={badge.image ? `/passports/${passportId}/${badge.image}` : `/passports/${passportId}/assets/images/badges/badge-${badge.id}.webp`}
                          alt={badge.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = `/passports/${passportId}/assets/images/badges/badge-${badge.id}.png`;
                          }}
                        />
                      )}
                    </div>
                    <p className="text-xs font-medium truncate group-hover:text-blue-600">{badge.name}</p>
                    <p className="text-xs text-gray-400">{badge.time || '-'}</p>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Preview Link */}
          <section className="pt-6 border-t">
            <a
              href={`/event/${passportId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <span>Open Passport</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </section>
        </div>

        {/* Mobile Preview Section (1/3) */}
        <div className="w-1/3 sticky top-6 self-start">
          <div className="bg-black rounded-[40px] p-3 shadow-xl max-w-[320px] ml-auto">
            {/* Dynamic Island / Notch */}
            <div className="bg-black h-7 w-28 mx-auto rounded-full flex items-center justify-center mb-2">
              <div className="bg-gray-900 h-5 w-24 rounded-full" />
            </div>
            {/* Screen */}
            <div className="bg-white rounded-[32px] overflow-hidden" style={{ aspectRatio: '9/19.5' }}>
              <iframe
                key={refreshKey}
                src={`/event/${passportId}`}
                className="w-full h-full border-0"
                title="Passport Preview"
              />
            </div>
            {/* Home Indicator */}
            <div className="mt-2 flex justify-center">
              <div className="bg-gray-600 h-1 w-32 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Badge Edit Modal */}
      {editingBadge && (
        <BadgeEditModal
          badge={editingBadge === 'new' ? null : editingBadge}
          isNew={editingBadge === 'new'}
          badgeTypes={passport.badgeTypes}
          allBadges={passport.badges}
          passportId={passportId}
          onSave={handleSaveBadge}
          onClose={() => setEditingBadge(null)}
        />
      )}
    </div>
  );
}

function PasswordGate({ children }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [authenticated, setAuthenticated] = useState(() => {
    return sessionStorage.getItem('admin_authenticated') === 'true';
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD;

    if (password === adminPassword) {
      sessionStorage.setItem('admin_authenticated', 'true');
      setAuthenticated(true);
      setError(false);
    } else {
      setError(true);
    }
  };

  if (authenticated) {
    return children;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-6">Admin Access</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className={`w-full px-4 py-3 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              error ? 'border-red-500' : 'border-gray-300'
            }`}
            autoFocus
          />
          {error && (
            <p className="text-red-500 text-sm mb-4">Incorrect password</p>
          )}
          <button
            type="submit"
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Enter
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AdminApp() {
  return (
    <PasswordGate>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link to="/admin" className="flex items-center gap-2">
              <span className="text-xl font-bold">Passport Admin</span>
            </Link>
            <nav>
              <Link
                to="/"
                className="text-gray-600 hover:text-gray-900 text-sm"
              >
                View Site
              </Link>
            </nav>
          </div>
        </header>

        {/* Content */}
        <main className="max-w-7xl mx-auto">
          <Routes>
            <Route path="/" element={<PassportList />} />
            <Route path="/:passportId" element={<PassportDetail />} />
          </Routes>
        </main>
      </div>
    </PasswordGate>
  );
}
