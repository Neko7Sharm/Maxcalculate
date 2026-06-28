let isDark = false;
        let history = [];
        let presets = [];
        let editingPresetId = null;
        let deletingPresetId = null;
        let selectedEmoji = '⭐';

        // Available emojis for preset icons
        const availableEmojis = [
            '⭐', '🌟', '💫', '✨', '🔥', '⚡', '💎', '🎯',
            '🎮', '🎲', '🎪', '🎨', '🎵', '🎬', '📱', '💻',
            '🖥️', '⌨️', '🖱️', '📊', '📈', '📉', '📋', '📝',
            '📚', '📖', '🔧', '🔨', '⚙️', '🔩', '🔌', '💡',
            '🏆', '🎁', '💰', '💵', '💳', '🛒', '🛍️', '📦',
            '🚀', '✈️', '🚗', '🏠', '🏢', '🌍', '🌈', '☀️',
            '🌙', '⚽', '🏀', '🎾', '🏊', '🚴', '🎣', '🍕',
            '🍔', '🍎', '🥤', '☕', '🍺', '🎂', '🍫', '🍿',
            '❤️', '💙', '💚', '💛', '💜', '🖤', '🤍', '💖',
            '👑', '🎓', '💼', '🔑', '🗝️', '🛡️', '⚔️', '🏹',
            '📐', '📏', '🧮'
        ];

        // Default presets (พื้นฐาน) - มีแค่ A (Base Max) และ B (Target Max)
        const defaultPresets = [
            {
                id: 'default-color',
                name: 'ค่าสี (RGB)',
                icon: '🎨',
                a: 255,
                b: 100,
                isDefault: true,
                createdAt: new Date().toISOString()
            },
            {
                id: 'default-degree',
                name: 'องศา (Degree)',
                icon: '📐',
                a: 360,
                b: 512,
                isDefault: true,
                createdAt: new Date().toISOString()
            },
            {
                id: 'default-percent',
                name: 'เปอร์เซ็นต์ (%)',
                icon: '📊',
                a: 100,
                b: 1000,
                isDefault: true,
                createdAt: new Date().toISOString()
            }
        ];

        // Load from localStorage
        function loadData() {
            try {
                const savedPresets = localStorage.getItem('calcPresets');
                if (savedPresets) {
                    presets = JSON.parse(savedPresets);
                    // Migrate old presets (remove c field if exists)
                    let migrated = false;
                    presets = presets.map(p => {
                        if ('c' in p) {
                            migrated = true;
                            const { c, ...rest } = p;
                            return rest;
                        }
                        return p;
                    });
                    if (migrated) savePresets();
                } else {
                    presets = [...defaultPresets];
                    savePresets();
                }
                const savedHistory = localStorage.getItem('calcHistory');
                if (savedHistory) {
                    history = JSON.parse(savedHistory);
                }
                const savedTheme = localStorage.getItem('calcTheme');
                if (savedTheme === 'dark') {
                    if (!isDark) toggleTheme();
                }
            } catch (e) {
                console.error('Error loading data:', e);
                presets = [...defaultPresets];
            }
        }

        function savePresets() {
            try {
                localStorage.setItem('calcPresets', JSON.stringify(presets));
            } catch (e) {
                console.error('Error saving presets:', e);
            }
        }

        function saveHistory() {
            try {
                localStorage.setItem('calcHistory', JSON.stringify(history));
            } catch (e) {
                console.error('Error saving history:', e);
            }
        }

        function toggleTheme() {
            isDark = !isDark;
            const html = document.documentElement;
            const bg = document.getElementById('bg');
            const card = document.getElementById('mainCard');
            const icon = document.getElementById('themeIcon');
            const label = document.getElementById('themeLabel');
            const track = document.getElementById('toggleTrack');
            const knob = document.getElementById('toggleKnob');

            if (isDark) {
                html.classList.remove('light');
                html.classList.add('dark');
                bg.classList.remove('gradient-bg-light');
                bg.classList.add('gradient-bg-dark');
                card.classList.remove('card-light');
                card.classList.add('card-dark');
                icon.textContent = '🌙';
                label.textContent = 'มืด';
                track.classList.remove('toggle-track-light');
                track.classList.add('toggle-track-dark');
                knob.style.transform = 'translateX(20px)';
                try { localStorage.setItem('calcTheme', 'dark'); } catch(e) {}
            } else {
                html.classList.remove('dark');
                html.classList.add('light');
                bg.classList.remove('gradient-bg-dark');
                bg.classList.add('gradient-bg-light');
                card.classList.remove('card-dark');
                card.classList.add('card-light');
                icon.textContent = '☀️';
                label.textContent = 'สว่าง';
                track.classList.remove('toggle-track-dark');
                track.classList.add('toggle-track-light');
                knob.style.transform = 'translateX(0)';
                try { localStorage.setItem('calcTheme', 'light'); } catch(e) {}
            }

            updateCardThemes();
        }

        function updateCardThemes() {
            const cards = ['historyCard', 'presetsCard'];
            cards.forEach(id => {
                const el = document.getElementById(id);
                if (el) {
                    if (isDark) {
                        el.classList.remove('card-light');
                        el.classList.add('card-dark');
                    } else {
                        el.classList.remove('card-dark');
                        el.classList.add('card-light');
                    }
                }
            });

            document.querySelectorAll('input[type="number"], input[type="text"]').forEach(input => {
                if (isDark) {
                    input.classList.remove('input-light');
                    input.classList.add('input-dark');
                } else {
                    input.classList.remove('input-dark');
                    input.classList.add('input-light');
                }
            });

            const resultBox = document.querySelector('.result-box-light, .result-box-dark');
            if (resultBox) {
                if (isDark) {
                    resultBox.classList.remove('result-box-light');
                    resultBox.classList.add('result-box-dark');
                } else {
                    resultBox.classList.remove('result-box-dark');
                    resultBox.classList.add('result-box-light');
                }
            }

            renderPresets();
        }

        function autoCalculate() {
            const a = parseFloat(document.getElementById('inputA').value);
            const b = parseFloat(document.getElementById('inputB').value);
            const c = parseFloat(document.getElementById('inputC').value);

            if (!isNaN(a) && !isNaN(b) && !isNaN(c) && a !== 0) {
                calculate(true);
            }
        }

        function calculate(isAuto = false) {
            const a = parseFloat(document.getElementById('inputA').value);
            const b = parseFloat(document.getElementById('inputB').value);
            const c = parseFloat(document.getElementById('inputC').value);

            const errorBox = document.getElementById('errorBox');
            const resultBox = document.getElementById('resultBox');

            if (isNaN(a) || isNaN(b) || isNaN(c)) {
                if (!isAuto) {
                    showError('กรุณากรอกค่าให้ครบทั้ง 3 ช่อง');
                }
                return;
            }

            if (a === 0) {
                showError('ค่าเต็มต้น (A) ต้องไม่เท่ากับ 0');
                return;
            }

            if (a < 0 || b < 0 || c < 0) {
                showError('ค่าทั้งหมดต้องไม่เป็นค่าลบ');
                return;
            }

            if (c > a) {
                showError('ค่าที่อยากหา (C) ต้องไม่มากกว่าค่าเต็มต้น (A)');
                return;
            }

            errorBox.classList.add('hidden');

            const result = (c / a) * b;
            const percentage = (c / a) * 100;

            resultBox.classList.remove('hidden');
            resultBox.classList.add('animate-scale-in');

            const resultValue = document.getElementById('resultValue');
            const formattedResult = Number.isInteger(result) ? result.toLocaleString() : result.toFixed(4).replace(/\.?0+$/, '');
            resultValue.textContent = formattedResult;
            resultValue.classList.remove('animate-number-pop');
            void resultValue.offsetWidth;
            resultValue.classList.add('animate-number-pop');

            const desc = document.getElementById('resultDescription');
            desc.innerHTML = `ถ้า <span class="font-bold">${c}</span> เต็ม <span class="font-bold">${a}</span> → จะเท่ากับ <span class="font-bold">${formattedResult}</span> เต็ม <span class="font-bold">${b}</span>`;

            const progressBar = document.getElementById('progressBar');
            const percentText = document.getElementById('percentText');
            const barMax = document.getElementById('barMax');
            
            setTimeout(() => {
                progressBar.style.width = Math.min(percentage, 100) + '%';
            }, 100);
            percentText.textContent = percentage.toFixed(1) + '%';
            barMax.textContent = b.toLocaleString();

            const breakdown = document.getElementById('breakdown');
            breakdown.innerHTML = `(${c} ÷ ${a}) × ${b} = <span class="font-bold text-indigo-500 dark:text-indigo-400">${formattedResult}</span>`;

            if (!isAuto) {
                addToHistory(a, b, c, result);
            }

            if (isDark) {
                const innerBox = resultBox.querySelector('div');
                if (innerBox) {
                    innerBox.classList.remove('result-box-light');
                    innerBox.classList.add('result-box-dark');
                }
            }
        }

        function showError(msg) {
            const errorBox = document.getElementById('errorBox');
            const resultBox = document.getElementById('resultBox');
            document.getElementById('errorText').textContent = msg;
            errorBox.classList.remove('hidden');
            resultBox.classList.add('hidden');
        }

        function resetAll() {
            document.getElementById('inputA').value = '';
            document.getElementById('inputB').value = '';
            document.getElementById('inputC').value = '';
            document.getElementById('resultBox').classList.add('hidden');
            document.getElementById('errorBox').classList.add('hidden');
            document.getElementById('progressBar').style.width = '0%';
            document.getElementById('inputA').focus();
        }

        function copyResult() {
            const resultText = document.getElementById('resultValue').textContent;
            navigator.clipboard.writeText(resultText).then(() => {
                const btn = document.getElementById('copyBtn');
                btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> คัดลอกแล้ว!`;
                setTimeout(() => {
                    btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> คัดลอก`;
                }, 2000);
            });
        }

        function addToHistory(a, b, c, result) {
            const formattedResult = Number.isInteger(result) ? result.toLocaleString() : result.toFixed(4).replace(/\.?0+$/, '');
            history.unshift({ a, b, c, result: formattedResult, time: new Date().toISOString() });
            if (history.length > 10) history.pop();
            renderHistory();
            saveHistory();
        }

        function renderHistory() {
            const section = document.getElementById('historySection');
            const list = document.getElementById('historyList');

            if (history.length === 0) {
                section.classList.add('hidden');
                return;
            }

            section.classList.remove('hidden');
            list.innerHTML = history.map((item, i) => `
                <div class="history-item-light dark:history-item-dark rounded-xl p-3 flex items-center justify-between transition-all duration-300 hover:scale-[1.01] cursor-pointer" onclick="loadFromHistory(${i})">
                    <div class="flex-1 min-w-0">
                        <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
                            ${item.c} / ${item.a} × ${item.b}
                        </p>
                    </div>
                    <div class="text-right ml-3">
                        <p class="text-sm font-bold text-indigo-600 dark:text-indigo-400">${item.result}</p>
                    </div>
                </div>
            `).join('');
        }

        function loadFromHistory(index) {
            const item = history[index];
            document.getElementById('inputA').value = item.a;
            document.getElementById('inputB').value = item.b;
            document.getElementById('inputC').value = item.c;
            calculate();
        }

        function clearHistory() {
            history = [];
            renderHistory();
            saveHistory();
        }

        // ==================== PRESETS ====================

        function renderEmojiGrid() {
            const grid = document.getElementById('emojiGrid');
            grid.innerHTML = availableEmojis.map(emoji => `
                <button type="button" onclick="selectEmoji('${emoji}')" 
                    class="emoji-btn w-9 h-9 rounded-lg flex items-center justify-center text-xl hover:bg-gray-200 dark:hover:bg-gray-700 ${selectedEmoji === emoji ? 'selected' : 'bg-white dark:bg-gray-900'}"
                    data-emoji="${emoji}">
                    ${emoji}
                </button>
            `).join('');
        }

        function selectEmoji(emoji) {
            selectedEmoji = emoji;
            renderEmojiGrid();
            updatePresetPreview();
        }

        function openAddPresetModal() {
            editingPresetId = null;
            selectedEmoji = '⭐';
            document.getElementById('modalTitle').innerHTML = '➕ เพิ่มรายการใหม่';
            document.getElementById('saveBtnText').textContent = 'บันทึกรายการ';
            document.getElementById('presetName').value = '';
            document.getElementById('presetA').value = '';
            document.getElementById('presetB').value = '';
            document.getElementById('presetError').classList.add('hidden');
            document.getElementById('presetPreview').classList.add('hidden');
            
            renderEmojiGrid();
            
            const modal = document.getElementById('presetModal');
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            
            setTimeout(() => document.getElementById('presetName').focus(), 100);
        }

        function openEditPresetModal(id) {
            const preset = presets.find(p => p.id === id);
            if (!preset) return;

            editingPresetId = id;
            selectedEmoji = preset.icon;
            document.getElementById('modalTitle').innerHTML = '✏️ แก้ไขรายการ';
            document.getElementById('saveBtnText').textContent = 'อัปเดต';
            document.getElementById('presetName').value = preset.name;
            document.getElementById('presetA').value = preset.a;
            document.getElementById('presetB').value = preset.b;
            document.getElementById('presetError').classList.add('hidden');
            
            renderEmojiGrid();
            updatePresetPreview();
            
            const modal = document.getElementById('presetModal');
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        }

        function closePresetModal() {
            const modal = document.getElementById('presetModal');
            modal.classList.add('hidden');
            modal.classList.remove('flex');
            editingPresetId = null;
        }

        function updatePresetPreview() {
            const name = document.getElementById('presetName').value.trim();
            const a = document.getElementById('presetA').value;
            const b = document.getElementById('presetB').value;
            const preview = document.getElementById('presetPreview');

            if (name || a || b) {
                preview.classList.remove('hidden');
                document.getElementById('previewIcon').textContent = selectedEmoji;
                document.getElementById('previewName').textContent = name || '(ไม่มีชื่อ)';
                document.getElementById('previewA').textContent = a ? `${a} (Base)` : '—';
                document.getElementById('previewB').textContent = b ? `${b} (Target)` : '—';
            } else {
                preview.classList.add('hidden');
            }
        }

        // Listen for input changes to update preview
        ['presetName', 'presetA', 'presetB'].forEach(id => {
            document.addEventListener('DOMContentLoaded', () => {
                const el = document.getElementById(id);
                if (el) {
                    el.addEventListener('input', updatePresetPreview);
                }
            });
        });

        function savePreset() {
            const name = document.getElementById('presetName').value.trim();
            const a = parseFloat(document.getElementById('presetA').value);
            const b = parseFloat(document.getElementById('presetB').value);

            // Validation
            if (!name) {
                showPresetError('กรุณาตั้งชื่อรายการ');
                return;
            }
            if (isNaN(a) || isNaN(b)) {
                showPresetError('กรุณากรอก Base Max และ Target Max ให้ครบ');
                return;
            }
            if (a === 0) {
                showPresetError('Base Max ต้องไม่เท่ากับ 0');
                return;
            }
            if (a < 0 || b < 0) {
                showPresetError('ค่าทั้งหมดต้องไม่เป็นค่าลบ');
                return;
            }

            document.getElementById('presetError').classList.add('hidden');

            if (editingPresetId) {
                // Update existing
                const index = presets.findIndex(p => p.id === editingPresetId);
                if (index !== -1) {
                    presets[index] = {
                        ...presets[index],
                        name,
                        icon: selectedEmoji,
                        a, b,
                        updatedAt: new Date().toISOString()
                    };
                }
            } else {
                // Add new
                const newPreset = {
                    id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
                    name,
                    icon: selectedEmoji,
                    a, b,
                    isDefault: false,
                    createdAt: new Date().toISOString()
                };
                presets.unshift(newPreset);
            }

            savePresets();
            renderPresets();
            closePresetModal();
        }

        function showPresetError(msg) {
            document.getElementById('presetErrorText').textContent = msg;
            document.getElementById('presetError').classList.remove('hidden');
        }

        function renderPresets() {
            const grid = document.getElementById('presetsGrid');
            const empty = document.getElementById('presetsEmpty');
            const count = document.getElementById('presetCount');

            count.textContent = `(${presets.length} รายการ)`;

            if (presets.length === 0) {
                empty.classList.remove('hidden');
                grid.classList.add('hidden');
                return;
            }

            empty.classList.add('hidden');
            grid.classList.remove('hidden');

            grid.innerHTML = presets.map((preset, index) => {
                const isDefault = preset.isDefault === true;
                const ratio = (preset.b / preset.a).toFixed(2);
                
                return `
                <div class="preset-card-light dark:preset-card-dark rounded-xl p-4 transition-all duration-300 animate-slide-in cursor-pointer group relative" 
                     style="animation-delay: ${index * 0.05}s"
                     onclick="loadPreset('${preset.id}')">
                    ${isDefault ? '<div class="absolute -top-2 -right-2 default-badge text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md">พื้นฐาน</div>' : ''}
                    <div class="flex items-start justify-between mb-3">
                        <div class="flex items-center gap-2.5 min-w-0 flex-1">
                            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 flex items-center justify-center flex-shrink-0">
                                <span class="text-xl">${preset.icon}</span>
                            </div>
                            <div class="min-w-0 flex-1">
                                <p class="text-sm font-bold text-gray-700 dark:text-gray-200 truncate">${escapeHtml(preset.name)}</p>
                                <p class="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">อัตราส่วน ×${ratio}</p>
                            </div>
                        </div>
                        <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" onclick="event.stopPropagation()">
                            <button onclick="openEditPresetModal('${preset.id}')" 
                                class="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 flex items-center justify-center transition-colors"
                                title="แก้ไข">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-blue-600 dark:text-blue-400"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                            </button>
                            <button onclick="openDeleteModal('${preset.id}')" 
                                class="w-7 h-7 rounded-lg bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 flex items-center justify-center transition-colors"
                                title="ลบ">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-red-600 dark:text-red-400"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                            </button>
                        </div>
                    </div>
                    <div class="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
                        <span class="text-sm font-bold font-mono text-indigo-600 dark:text-indigo-400">${preset.a.toLocaleString()}</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="arrow-flow"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                        <span class="text-sm font-bold font-mono text-purple-600 dark:text-purple-400">${preset.b.toLocaleString()}</span>
                    </div>
                    <p class="text-[10px] text-gray-400 dark:text-gray-500 text-center mt-2">
                        👆 แตะเพื่อใช้ → ใส่ค่า C แล้วคำนวณ
                    </p>
                </div>
                `;
            }).join('');
        }

        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        function loadPreset(id) {
            const preset = presets.find(p => p.id === id);
            if (!preset) return;

            // ใส่แค่ A (Base Max) และ B (Target Max) เท่านั้น
            document.getElementById('inputA').value = preset.a;
            document.getElementById('inputB').value = preset.b;
            // เคลียร์ค่า C ให้ user ใส่เอง
            document.getElementById('inputC').value = '';
            // ซ่อนผลลัพธ์เก่า
            document.getElementById('resultBox').classList.add('hidden');
            document.getElementById('errorBox').classList.add('hidden');
            document.getElementById('progressBar').style.width = '0%';

            window.scrollTo({ top: 0, behavior: 'smooth' });
            // โฟกัสที่ช่อง C เพื่อให้ user ใส่ค่า
            setTimeout(() => {
                const inputC = document.getElementById('inputC');
                inputC.focus();
                inputC.classList.add('animate-pulse-glow');
                setTimeout(() => inputC.classList.remove('animate-pulse-glow'), 1500);
            }, 400);
        }

        function openDeleteModal(id) {
            deletingPresetId = id;
            const preset = presets.find(p => p.id === id);
            if (!preset) return;

            document.getElementById('deleteItemName').innerHTML = 
                `<span class="text-lg">${preset.icon}</span> <span class="font-bold">"${escapeHtml(preset.name)}"</span>`;
            
            const modal = document.getElementById('deleteModal');
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        }

        function closeDeleteModal() {
            const modal = document.getElementById('deleteModal');
            modal.classList.add('hidden');
            modal.classList.remove('flex');
            deletingPresetId = null;
        }

        function confirmDelete() {
            if (!deletingPresetId) return;
            presets = presets.filter(p => p.id !== deletingPresetId);
            savePresets();
            renderPresets();
            closeDeleteModal();
        }

        // Close modals on backdrop click
        document.getElementById('presetModal').addEventListener('click', (e) => {
            if (e.target.id === 'presetModal') closePresetModal();
        });
        document.getElementById('deleteModal').addEventListener('click', (e) => {
            if (e.target.id === 'deleteModal') closeDeleteModal();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !document.getElementById('presetModal').classList.contains('flex')) {
                calculate();
            }
            if (e.key === 'Escape') {
                if (document.getElementById('presetModal').classList.contains('flex')) {
                    closePresetModal();
                } else if (document.getElementById('deleteModal').classList.contains('flex')) {
                    closeDeleteModal();
                } else {
                    resetAll();
                }
            }
        });

        // Initial load
        window.addEventListener('load', () => {
            loadData();
            renderHistory();
            renderPresets();
            document.getElementById('inputA').focus();
        });
