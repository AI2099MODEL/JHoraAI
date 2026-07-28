                {/* Birth Details and Cast Settings Card (First Section) */}
                <div className={`p-6 rounded-2xl border ${containerStyle}`}>
                  <div className="border-b border-indigo-500/10 pb-4 mb-6">
                    <h3 className={`text-lg font-sans font-medium flex items-center gap-2 ${headingStyle}`}>
                      <Sparkles className="w-5 h-5 text-amber-500" />
                      Birth Details & Cast Settings
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Configure your name, birth coordinates, GMT offset, and casting properties to generate your Vedic, KP Stellar, and Western astrology charts.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                        <User className="w-4 h-4 text-amber-500" />
                        Native Identity & Time
                      </h4>
                      <div>
                        <label className="block text-[11px] text-slate-400 font-medium mb-1">Native Name</label>
                        <input
                          type="text"
                          value={inputs.name}
                          onChange={(e) => setInputs({ ...inputs, name: e.target.value })}
                          className={`w-full border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                            isDark ? "bg-slate-950 border-slate-800 text-slate-100" : "bg-white border-neutral-300 text-neutral-800"
                          }`}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] text-slate-400 font-medium mb-1">Date of Birth</label>
                          <input
                            type="date"
                            value={inputs.date}
                            onChange={(e) => setInputs({ ...inputs, date: e.target.value })}
                            className={`w-full border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                              isDark ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-white border-neutral-300 text-neutral-800"
                            }`}
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-400 font-medium mb-1">Time of Birth</label>
                          <div className="flex gap-1.5">
                            <div className="relative flex-1">
                              <Clock className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500 hover:text-amber-500 transition-colors" />
                              <input
                                type="text"
                                placeholder="e.g. 08:30"
                                value={localTimeInput}
                                onChange={(e) => setLocalTimeInput(e.target.value)}
                                className={`w-full border rounded-lg pl-8 pr-2 py-2 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                                  isDark ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-white border-neutral-300 text-neutral-800"
                                }`}
                              />
                            </div>
                            <select
                              value={localAmpm}
                              onChange={(e) => setLocalAmpm(e.target.value)}
                              className={`border rounded-lg px-2 py-2 text-xs font-medium cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                                isDark ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-white border-neutral-300 text-neutral-800"
                              }`}
                            >
                              <option value="AM">AM</option>
                              <option value="PM">PM</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="relative">
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[11px] text-slate-400 font-medium">Location / City</label>
                          <button
                            type="button"
                            onClick={handleUseGps}
                            disabled={fetchingGps}
                            className="text-[10px] text-amber-500 hover:text-amber-400 font-mono flex items-center gap-1 bg-transparent border-0 cursor-pointer p-0 disabled:opacity-50"
                          >
                            <MapPin className="w-3 h-3 animate-pulse text-amber-500" />
                            {fetchingGps ? "Locating..." : "Use device GPS"}
                          </button>
                        </div>
                        <div className="relative z-50">
                          <input
                            type="text"
                            value={inputs.location}
                            onChange={(e) => {
                              setInputs({ ...inputs, location: e.target.value });
                              setShowLocationDropdown(true);
                            }}
                            onFocus={() => {
                              if (locationResults.length > 0) setShowLocationDropdown(true);
                            }}
                            placeholder="Type a city (e.g. Mumbai, New York)..."
                            className={`w-full border rounded-lg pl-3 pr-8 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                              isDark ? "bg-slate-950 border-slate-800 text-slate-100" : "bg-white border-neutral-300 text-neutral-800"
                            }`}
                          />
                          {searchingLocation && (
                            <div className="absolute right-2.5 top-2.5">
                              <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-500" />
                            </div>
                          )}
                        </div>

                        {showLocationDropdown && (
                          <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setShowLocationDropdown(false)} />
                        )}

                        {showLocationDropdown && locationResults.length > 0 && (
                          <div className={`absolute z-50 left-0 right-0 mt-1 border rounded-lg shadow-xl max-h-48 overflow-y-auto divide-y divide-slate-900 scrollbar-thin ${
                            isDark ? "bg-slate-950 border-slate-800" : "bg-white border-neutral-200"
                          }`}>
                            {locationResults.map((result, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => handleSelectLocation(result)}
                                className="w-full text-left px-3 py-2 text-xs hover:bg-slate-500/10 transition-colors flex flex-col cursor-pointer border-0 bg-transparent"
                              >
                                <span className={`font-semibold ${isDark ? "text-slate-200" : "text-neutral-700"}`}>{result.name}</span>
                                <span className="text-[10px] text-slate-500 font-mono mt-0.5">
                                  {result.admin1 ? `${result.admin1}, ` : ''}{result.country} • Lat: {Number(result.latitude || 0).toFixed(4)} Lon: {Number(result.longitude || 0).toFixed(4)}
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-amber-500" />
                        Geographic Coordinates
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] text-slate-500 font-mono uppercase">Latitude (°N)</label>
                          <input
                            type="number"
                            step="0.0001"
                            value={inputs.latitude}
                            onChange={(e) => setInputs({ ...inputs, latitude: Number(e.target.value) })}
                            className={`w-full border rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                              isDark ? "bg-slate-950 border-slate-800 text-slate-300" : "bg-white border-neutral-300 text-neutral-800"
                            }`}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-500 font-mono uppercase">Longitude (°E)</label>
                          <input
                            type="number"
                            step="0.0001"
                            value={inputs.longitude}
                            onChange={(e) => setInputs({ ...inputs, longitude: Number(e.target.value) })}
                            className={`w-full border rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                              isDark ? "bg-slate-950 border-slate-800 text-slate-300" : "bg-white border-neutral-300 text-neutral-800"
                            }`}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-500 font-mono uppercase">Timezone (GMT Offset)</label>
                        <input
                          type="number"
                          step="0.5"
                          value={inputs.timezone}
                          onChange={(e) => setInputs({ ...inputs, timezone: Number(e.target.value) })}
                          className={`w-full border rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                            isDark ? "bg-slate-950 border-slate-800 text-slate-300" : "bg-white border-neutral-300 text-neutral-800"
                          }`}
                        />
                      </div>

                      <div className="pt-2 space-y-2">
                        <button
                          onClick={() => handleCalculate(false, false)}
                          disabled={loading}
                          className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-semibold rounded-xl py-3 text-xs transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer shadow-amber-500/10"
                        >
                          <Sparkles className="w-4 h-4 text-slate-950" />
                          {loading ? "Casting Horoscope..." : "Cast & Generate Horoscope"}
                        </button>

                        {(() => {
                          const fTime = `${localTimeInput} ${localAmpm}`;
                          const currentKey = generateCompositeKey(inputs.date, fTime, Number(inputs.latitude), Number(inputs.longitude));
                          const hasCachedRecord = cachedList.some(r => r.id === currentKey && r.rawUserProfile);
                          
                          if (hasCachedRecord) {
                            return (
                              <button
                                onClick={() => handleCalculate(false, true)}
                                disabled={loading}
                                className="w-full border border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 text-amber-400 font-semibold rounded-xl py-2.5 text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                              >
                                <RefreshCw className={`w-4 h-4 text-amber-500 ${loading ? "animate-spin" : ""}`} />
                                Refresh Horoscope (Force Reload)
                              </button>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
