const fetch = (...args) =>
  import('node-fetch').then(({ default: fetchImpl }) => fetchImpl(...args));

const HUBSPOT_BASE_URL = 'https://api.hubapi.com/crm/v3/objects/contacts';

const upsertContact = async ({ email, firstName, lastName, classification, orderId }) => {
  const apiKey = process.env.HUBSPOT_API_KEY;

  if (!apiKey || !email) {
    return null;
  }

  const headers = {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };

  try {
    const searchResponse = await fetch(`${HUBSPOT_BASE_URL}/search`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        filterGroups: [
          {
            filters: [
              {
                propertyName: 'email',
                operator: 'EQ',
                value: email,
              },
            ],
          },
        ],
        properties: ['email', 'firstname', 'lastname', 'customer_classification', 'last_order_tag'],
      }),
    });

    if (!searchResponse.ok) {
      throw new Error(`HubSpot search failed: ${searchResponse.status}`);
    }

    const searchResult = await searchResponse.json();
    const existingContact = searchResult?.results?.[0];
    const lastOrderTag = orderId ? `Order #${orderId}` : 'Order update';

    if (existingContact) {
      const updateResponse = await fetch(`${HUBSPOT_BASE_URL}/${existingContact.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          properties: {
            customer_classification: classification,
            last_order_tag: lastOrderTag,
          },
        }),
      });

      if (!updateResponse.ok) {
        throw new Error(`HubSpot update failed: ${updateResponse.status}`);
      }

      return existingContact.id;
    }

    const createResponse = await fetch(HUBSPOT_BASE_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        properties: {
          email,
          firstname: firstName || '',
          lastname: lastName || '',
          customer_classification: classification,
          last_order_tag: lastOrderTag,
        },
      }),
    });

    if (!createResponse.ok) {
      throw new Error(`HubSpot create failed: ${createResponse.status}`);
    }

    const created = await createResponse.json();
    return created?.id || null;
  } catch (error) {
    console.error('HubSpot error', error);
    return null;
  }
};

module.exports = {
  upsertContact,
};
