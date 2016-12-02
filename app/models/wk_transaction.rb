class WkTransaction < ActiveRecord::Base
  unloadable
  has_many :transaction_details, foreign_key: "transaction_id", class_name: "WkTransactionDetail", :dependent => :destroy
  validates_presence_of :trans_date
end
