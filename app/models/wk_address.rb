# ERPmine - ERP for service industry
# Copyright (C) 2011-2016  Adhi software pvt ltd
#
# This program is free software; you can redistribute it and/or
# modify it under the terms of the GNU General Public License
# as published by the Free Software Foundation; either version 2
# of the License, or (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program; if not, write to the Free Software
# Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.

class WkAddress < ApplicationRecord


  include Redmine::SafeAttributes

  safe_attributes(
    'address1',
    'address2',
    'work_phone',
    'home_phone',
    'mobile',
    'email',
    'fax',
    'city',
    'country',
    'state',
    'pin',
    'department',
    'website',
    'longitude',
    'latitude'
  )
  has_many :wk_accounts, foreign_key: "address_id", class_name: "WkAccount"
  has_many :wk_contacts, foreign_key: "address_id", class_name: "WkCrmContact"
  has_many :wk_leads, foreign_key: "address_id", class_name: "WkLead"
  has_one :wk_user, foreign_key: "address_id", class_name: "WkUser"
  has_one :user, through: :wk_user
  validate :hasAnyValues

  def hasAnyValues
	errors.add(:base, (l(:label_address)  + " " + l('activerecord.errors.messages.blank'))) if address1.blank? && address2.blank? && work_phone.blank? && home_phone.blank? && mobile.blank? && email.blank? && fax.blank? && city.blank? && country.blank? && state.blank? && pin.blank? && department.blank? && department.blank? && id.blank? && longitude.blank? && latitude.blank?
  end

  def fullAddress
	fullAdd = (address1.blank? ? "" : address1 + "\n") + (address2.blank? ? "" : address2 + "\n")  + (city.blank? ? "" : city) + " " +  (state.blank? ? "" : state) + "\n" + (pin.blank? ? "" : pin.to_s )  + "\n" + (country.blank? ? "" : country)
	fullAdd
  end
end
