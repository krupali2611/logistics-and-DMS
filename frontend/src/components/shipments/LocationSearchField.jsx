import { useEffect, useMemo, useState } from 'react';
import { getLocationPlaceDetails, searchLocations } from '../../api/locationApi';
import styles from '../../styles/Shipment.module.css';

const formatSavedAddressLabel = (address) =>
  [address.address_type, address.formatted_address || address.address_line_1, address.city]
    .filter(Boolean)
    .join(' - ');

const formatSavedAddressValue = (address) =>
  address.formatted_address ||
  [
    address.address_line_1,
    address.address_line_2,
    address.landmark,
    address.city,
    address.state,
    address.country,
    address.pincode
  ]
    .filter(Boolean)
    .join(', ');

const normalizeLocation = (location) => ({
  saved_address_id: location.saved_address_id || null,
  address: location.address || '',
  address_snapshot: location.address_snapshot || location.address || '',
  latitude: location.latitude ?? '',
  longitude: location.longitude ?? '',
  place_id: location.place_id || '',
  city: location.city || '',
  state: location.state || '',
  country: location.country || '',
  pincode: location.pincode || '',
  saved_address: location.saved_address || null
});

const LocationSearchField = ({
  label,
  customerId,
  savedAddresses = [],
  value,
  onChange,
  onSaveAddress,
  onActivateMapTarget,
  showCurrentLocation = false,
  mapTargetActive = false,
  required = false,
  disabled = false
}) => {
  const [query, setQuery] = useState(value.address || '');
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [error, setError] = useState('');
  const [shouldShowSuggestions, setShouldShowSuggestions] = useState(false);

  const favoriteAddresses = useMemo(
    () =>
      savedAddresses
        .filter((address) => address.is_favorite || address.is_default)
        .slice(0, 6),
    [savedAddresses]
  );

  const localMatches = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (search.length < 2) {
      return [];
    }

    return savedAddresses
      .filter((address) => formatSavedAddressValue(address).toLowerCase().includes(search))
      .slice(0, 6)
      .map((address) => ({
        id: `local-${address.id}`,
        savedAddress: address,
        addressText: formatSavedAddressValue(address)
      }));
  }, [query, savedAddresses]);

  useEffect(() => {
    setQuery(value.address || '');
  }, [value.address]);

  useEffect(() => {
    if (!shouldShowSuggestions || !query || query.trim().length < 3 || disabled) {
      setSuggestions([]);
      return undefined;
    }

    let active = true;
    const timer = window.setTimeout(async () => {
      setSearching(true);

      try {
        const results = await searchLocations({
          q: query.trim(),
          customer_id: customerId || undefined,
          limit: 8
        });

        if (active) {
          setSuggestions(results);
          setError('');
        }
      } catch (requestError) {
        if (active) {
          setSuggestions([]);
          setError(requestError.response?.data?.message || `Unable to search ${label.toLowerCase()}.`);
        }
      } finally {
        if (active) {
          setSearching(false);
        }
      }
    }, 280);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [customerId, disabled, label, query]);

  const applyLocation = (location) => {
    onChange(normalizeLocation(location));
    setQuery(location.address || '');
    setSuggestions([]);
    setShouldShowSuggestions(false);
    setError('');
  };

  const handleSuggestionSelect = async (suggestion) => {
    setResolving(true);

    try {
      const location =
        suggestion.city && suggestion.country && suggestion.address
          ? suggestion
          : await getLocationPlaceDetails({
              place_id: suggestion.place_id,
              customer_id: customerId || undefined
            });

      applyLocation(location);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load the selected location.');
    } finally {
      setResolving(false);
    }
  };

  const handleSavedAddressSelect = (address) => {
    applyLocation({
      saved_address_id: address.id,
      address: formatSavedAddressValue(address),
      latitude: address.latitude,
      longitude: address.longitude,
      place_id: address.place_id,
      city: address.city,
      state: address.state,
      country: address.country,
      pincode: address.pincode,
      saved_address: address
    });
  };

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Current location is not supported in this browser.');
      return;
    }

    setResolving(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const location = await getLocationPlaceDetails({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            customer_id: customerId || undefined
          });
          applyLocation(location);
        } catch (requestError) {
          setError(requestError.response?.data?.message || 'Unable to resolve current location.');
        } finally {
          setResolving(false);
        }
      },
      () => {
        setResolving(false);
        setError('Unable to read current location.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const mergedSuggestions = [...localMatches, ...suggestions].filter((item, index, collection) => {
    const currentKey =
      item.savedAddress?.id || item.place_id || item.addressText || item.address;
    return (
      collection.findIndex((candidate) => {
        const candidateKey =
          candidate.savedAddress?.id ||
          candidate.place_id ||
          candidate.addressText ||
          candidate.address;
        return candidateKey === currentKey;
      }) === index
    );
  });

  const hasCoordinates =
    Number.isFinite(Number(value.latitude)) && Number.isFinite(Number(value.longitude));

  return (
    <div className={styles.locationFieldShell}>
      <div className={styles.locationFieldHeader}>
        <label className={`${styles.field} ${styles.fullWidth}`}>
          <span>{label}</span>
          <div className={styles.locationSearchBox}>
            <input
              value={query}
              onFocus={() => {
                onActivateMapTarget?.();
                if (query.trim().length >= 3) {
                  setShouldShowSuggestions(true);
                }
              }}
              onChange={(event) => {
                const nextQuery = event.target.value;
                setQuery(nextQuery);
                setShouldShowSuggestions(nextQuery.trim().length >= 3);
                setSuggestions([]);
                onChange({
                  ...value,
                  saved_address_id: null,
                  address: nextQuery,
                  address_snapshot: nextQuery,
                  latitude: '',
                  longitude: '',
                  place_id: '',
                  city: '',
                  state: '',
                  country: '',
                  pincode: '',
                  saved_address: null
                });
              }}
              placeholder={`Search ${label.toLowerCase()}`}
              required={required}
              disabled={disabled}
            />

            {shouldShowSuggestions && mergedSuggestions.length > 0 ? (
              <div className={styles.locationSuggestionList}>
                {mergedSuggestions.map((suggestion) => {
                  const isSavedAddress = Boolean(suggestion.savedAddress);
                  return (
                    <button
                      key={
                        suggestion.id ||
                        suggestion.place_id ||
                        suggestion.addressText ||
                        suggestion.address
                      }
                      type="button"
                      className={styles.locationSuggestion}
                      onClick={() =>
                        isSavedAddress
                          ? handleSavedAddressSelect(suggestion.savedAddress)
                          : handleSuggestionSelect(suggestion)
                      }
                      disabled={disabled}
                    >
                      <strong>{isSavedAddress ? suggestion.addressText : suggestion.address}</strong>
                      <span>
                        {isSavedAddress
                          ? [
                              suggestion.savedAddress.city,
                              suggestion.savedAddress.state,
                              suggestion.savedAddress.country,
                              suggestion.savedAddress.pincode
                            ]
                              .filter(Boolean)
                              .join(', ') || 'Saved address'
                          : [
                              suggestion.city,
                              suggestion.state,
                              suggestion.country,
                              suggestion.pincode
                            ]
                              .filter(Boolean)
                              .join(', ') || suggestion.provider}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>
        </label>

        <div className={styles.locationActionRow}>
          <button
            type="button"
            className={`${styles.secondaryButton} ${mapTargetActive ? styles.mapTargetButtonActive : ''}`.trim()}
            onClick={() => onActivateMapTarget?.()}
            disabled={disabled}
          >
            {mapTargetActive ? 'Map Target Active' : 'Select On Map'}
          </button>
          {showCurrentLocation ? (
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={handleCurrentLocation}
              disabled={disabled || resolving}
            >
              Use Current Location
            </button>
          ) : null}
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => onSaveAddress(value)}
            disabled={disabled || !customerId || !value.address}
          >
            Save Address
          </button>
          {searching || resolving ? <span className={styles.locationHint}>Loading...</span> : null}
        </div>
      </div>

      {favoriteAddresses.length > 0 ? (
        <div className={styles.locationChipRow}>
          {favoriteAddresses.map((address) => (
            <button
              key={address.id}
              type="button"
              className={styles.locationChip}
              onClick={() => handleSavedAddressSelect(address)}
              disabled={disabled}
            >
              {formatSavedAddressLabel(address)}
            </button>
          ))}
        </div>
      ) : null}

      {value.address ? (
        <div className={styles.locationPreviewCard}>
          <strong>Selected Address</strong>
          <span>{value.address}</span>
          <span>
            {[value.city, value.state, value.country, value.pincode].filter(Boolean).join(', ') ||
              'Location selected from search or map'}
          </span>
          {hasCoordinates ? (
            <span>
              {Number(value.latitude).toFixed(6)}, {Number(value.longitude).toFixed(6)}
            </span>
          ) : null}
        </div>
      ) : null}

      {error ? <div className={styles.errorBox}>{error}</div> : null}
    </div>
  );
};

export default LocationSearchField;
